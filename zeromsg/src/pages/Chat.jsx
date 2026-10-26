import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiCopy, FiTrash2, FiSend, FiUserPlus } from "react-icons/fi";

import Navbar from "../components/Navbar";
import {
  generateEncryptionKey,
  encryptMessage,
  decryptMessage,
} from "../encryption.js";
import "./styles/Chat.css";

function Chat() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const storageKey = `zeromsg-chat-${roomId}`;
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const copyTimeoutRef = useRef(null);
  const verificationRef = useRef(null);
  const verifiedRef = useRef(false);

  const [clientId] = useState(() => crypto.randomUUID());

  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(`zeromsg-chat-${roomId}`);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch {
      return [];
    }
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const mode = location.state?.mode || "join";
  const routeKey = location.state?.key;

  const showCopyMessage = (text) => {
    setCopyMessage(text);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyMessage("");
    }, 2000);
  };

  const sendVerificationResponse = async (data, secret) => {
    try {
      const plaintext = await decryptMessage(data.encrypted, secret);
      const challenge = JSON.parse(plaintext);

      if (
        challenge.type !== "verify" ||
        typeof challenge.challengeId !== "string" ||
        typeof challenge.nonce !== "string" ||
        typeof data.senderId !== "string"
      ) {
        return;
      }

      const encrypted = await encryptMessage(
        JSON.stringify({
          type: "verify-response",
          challengeId: challenge.challengeId,
          nonce: challenge.nonce,
        }),
        secret,
      );

      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "key-verification-response",
            targetClientId: data.senderId,
            encrypted,
          }),
        );
      }
    } catch {
      // A challenge encrypted with a different key is ignored.
    }
  };

  useEffect(() => {
    let cancelled = false;
    let socket;

    verifiedRef.current = false;
    verificationRef.current = null;

    async function connect() {
      try {
        let secret =
          new URLSearchParams(window.location.hash.slice(1)).get("key") ||
          routeKey;

        if (!secret && mode === "create") {
          secret = await generateEncryptionKey();
        }

        if (cancelled) return;

        if (!secret) {
          setError(
            "Encryption key missing. Open an invitation link or enter the key.",
          );
          return;
        }

        setEncryptionKey(secret);

        // Keep the key in the URL fragment so a page refresh can reuse it.
        if (
          new URLSearchParams(window.location.hash.slice(1)).get("key") !==
          secret
        ) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${window.location.search}#key=${encodeURIComponent(
              secret,
            )}`,
          );
        }

        socket = new WebSocket("ws://localhost:8080");
        socketRef.current = socket;

        socket.onopen = () => {
          if (cancelled) {
            socket.close();
            return;
          }

          socket.send(
            JSON.stringify({
              type: mode === "create" ? "create-room" : "join-room",
              roomId,
              clientId,
            }),
          );
        };

        socket.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "room-created") {
              verifiedRef.current = true;
              setConnectionStatus("ready");
              setError("");
              return;
            }

            if (data.type === "room-joined") {
              verifiedRef.current = false;
              setConnectionStatus("verifying");

              const challengeId = crypto.randomUUID();
              const nonce = crypto.randomUUID();

              verificationRef.current = {
                challengeId,
                nonce,
                timeout: null,
              };

              const encrypted = await encryptMessage(
                JSON.stringify({
                  type: "verify",
                  challengeId,
                  nonce,
                }),
                secret,
              );

              if (cancelled || socket.readyState !== WebSocket.OPEN) return;

              socket.send(
                JSON.stringify({
                  type: "key-verification-challenge",
                  encrypted,
                }),
              );

              verificationRef.current.timeout = setTimeout(() => {
                if (cancelled || verifiedRef.current) return;

                verificationRef.current = null;
                socket.close();

                navigate("/join", {
                  replace: true,
                  state: {
                    error:
                      "Encryption key verification failed. Check your key and try again.",
                  },
                });
              }, 5000);

              return;
            }

            if (data.type === "key-verification-challenge") {
              await sendVerificationResponse(data, secret);
              return;
            }

            if (data.type === "key-verification-response") {
              const pending = verificationRef.current;
              if (!pending) return;

              try {
                const plaintext = await decryptMessage(data.encrypted, secret);
                const response = JSON.parse(plaintext);

                if (
                  response.type === "verify-response" &&
                  response.challengeId === pending.challengeId &&
                  response.nonce === pending.nonce
                ) {
                  if (pending.timeout) clearTimeout(pending.timeout);
                  verificationRef.current = null;
                  verifiedRef.current = true;
                  setConnectionStatus("ready");
                  setError("");
                }
              } catch {
                // Ignore invalid verification responses.
              }

              return;
            }

            if (data.type === "room-error") {
              if (verificationRef.current?.timeout) {
                clearTimeout(verificationRef.current.timeout);
              }

              verificationRef.current = null;
              verifiedRef.current = false;
              setError(data.message || "Unable to open this chat room.");
              setConnectionStatus("error");
              return;
            }

            if (data.type === "message") {
              try {
                const plaintext = await decryptMessage(data.encrypted, secret);

                if (cancelled) return;

                setMessages((previousMessages) => [
                  ...previousMessages,
                  {
                    id: crypto.randomUUID(),
                    text: plaintext,
                    sender: data.senderId === clientId ? "me" : "other",
                    time: new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  },
                ]);
              } catch {
                setError(
                  "Could not decrypt this message. The sender may be using a different encryption key.",
                );
              }

              return;
            }
          } catch (err) {
            if (!cancelled) {
              console.error("WebSocket message handling failed:", err);
            }
          }
        };

        socket.onclose = () => {
          if (socketRef.current === socket) {
            socketRef.current = null;
          }
        };

        socket.onerror = () => {
          if (!cancelled) {
            setError(
              "Connection problem. Check that the ZeroMSG server is running.",
            );
          }
        };
      } catch (err) {
        if (!cancelled) {
          console.error("Encryption setup failed:", err);
          setError("Could not initialize encryption.");
        }
      }
    }

    connect();

    return () => {
      cancelled = true;

      if (verificationRef.current?.timeout) {
        clearTimeout(verificationRef.current.timeout);
      }
      verificationRef.current = null;

      if (socket) {
        socket.close();
      }

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [roomId, clientId, mode, routeKey, navigate]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      console.error("Could not save chat history on this device.");
    }
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    const text = message.trim();

    if (!text) return;

    if (!verifiedRef.current) {
      setError("Wait until the encryption key is verified.");
      return;
    }

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("Unable to send message. Connection is not available.");
      return;
    }

    if (!encryptionKey) {
      setError("Encryption key is not available.");
      return;
    }

    try {
      setError("");

      const encrypted = await encryptMessage(text, encryptionKey);

      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        setError("Connection lost before the message could be sent.");
        return;
      }

      socketRef.current.send(
        JSON.stringify({
          type: "message",
          roomId,
          encrypted,
        }),
      );

      setMessage("");
    } catch (err) {
      console.error("Message encryption failed:", err);
      setError("Could not encrypt the message.");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (value, successMessage, errorMessage) => {
    try {
      await navigator.clipboard.writeText(value);
      setError("");
      showCopyMessage(successMessage);
    } catch {
      setError(errorMessage);
    }
  };

  const handleCopyRoomId = () => {
    copyToClipboard(roomId, "Room ID copied!", "Could not copy the Room ID.");
  };

  const handleCopyKey = () => {
    if (!encryptionKey) {
      setError("Encryption key is not available.");
      return;
    }

    copyToClipboard(
      encryptionKey,
      "Encryption key copied!",
      "Could not copy the encryption key.",
    );
  };

  const handleInvitePeople = () => {
    if (!encryptionKey) {
      setError("Encryption key is not available.");
      return;
    }

    const inviteUrl =
      `${window.location.origin}/chat/${roomId}` +
      `#key=${encodeURIComponent(encryptionKey)}`;

    copyToClipboard(
      inviteUrl,
      "Invitation link copied!",
      "Could not copy the invitation link.",
    );
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
    setShowClearConfirm(false);
  };

  return (
    <main className="chat-page">
      <Navbar />

      <div className="chat-content">
        <section className="chat-window">
          {copyMessage && <div className="copy-message">{copyMessage}</div>}

          <header className="chat-header">
            <div className="chat-room-info">
              <span className="room-label">ROOM:</span>

              <div className="room-top-row">
                <button
                  className="room-id"
                  onClick={handleCopyRoomId}
                  title="Copy room ID"
                >
                  <span>{roomId}</span>
                  <FiCopy />
                </button>

                <button
                  className="chat-clear-btn"
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <FiTrash2 />
                </button>
              </div>

              <div className="room-actions">
                <button
                  className="room-action-btn"
                  onClick={handleCopyKey}
                  title="Copy encryption key"
                >
                  <FiCopy />
                  <span>Copy Key</span>
                </button>

                <button
                  className="room-action-btn"
                  onClick={handleInvitePeople}
                  title="Copy invitation link"
                >
                  <FiUserPlus />
                  <span>Invite People</span>
                </button>
              </div>
            </div>
          </header>

          {connectionStatus === "verifying" && (
            <div className="chat-status">Verifying encryption key…</div>
          )}

          {error && <div className="chat-error">{error}</div>}

          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-symbol">
                  <span></span>
                </div>

                <h2>No messages yet</h2>
                <p>Start the conversation by sending a message.</p>
              </div>
            ) : (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`message-row ${
                    item.sender === "me" ? "message-me" : "message-other"
                  }`}
                >
                  <div className="message-bubble">
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef}></div>
          </div>

          <form
            className="message-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows="1"
            />

            <button
              type="submit"
              className="send-btn"
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </form>
        </section>
      </div>

      {showClearConfirm && (
        <div className="clear-confirm-overlay">
          <div className="clear-confirm-box">
            <h3>Clear Chat?</h3>
            <p>Clear all messages from this device?</p>

            <div className="clear-confirm-actions">
              <button
                className="clear-cancel-btn"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>

              <button className="clear-confirm-btn" onClick={confirmClearChat}>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Chat;
