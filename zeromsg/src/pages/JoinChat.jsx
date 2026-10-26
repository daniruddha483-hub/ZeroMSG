import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiLogIn, FiHash, FiArrowRight } from "react-icons/fi";

import Navbar from "../components/Navbar";
import "./styles/JoinChat.css";

function JoinChat() {
  const navigate = useNavigate();
  const location = useLocation();

  const [roomId, setRoomId] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [error, setError] = useState(location.state?.error || "");

  const handleJoinChat = () => {
    const id = roomId.trim();
    const key = encryptionKey.trim();

    if (!id || !key) {
      setError("Enter both the Room ID and Encryption Key.");
      return;
    }

    setError("");

    navigate(`/chat/${id}`, {
      state: {
        mode: "join",
        key,
      },
    });
  };

  return (
    <main className="join-chat">
      <Navbar />

      <div className="join-content">
        <div className="join-card">
          <div className="join-header">
            <div className="join-icon">
              <FiLogIn />
            </div>
            <h1>Join Chat</h1>
          </div>

          <p className="join-description">
            Enter the room details or open an invitation link.
          </p>

          <div className="join-input-group">
            <label htmlFor="room-id">Room ID</label>

            <div className="join-input-wrapper">
              <div className="join-input-icon">
                <FiHash />
              </div>

              <input
                id="room-id"
                type="text"
                placeholder="Enter room ID"
                autoComplete="off"
                value={roomId}
                onChange={(event) => {
                  setRoomId(event.target.value);
                  setError("");
                }}
              />
            </div>
          </div>

          <div className="join-input-group">
            <label htmlFor="encryption-key">Encryption Key</label>

            <input
              id="encryption-key"
              type="text"
              placeholder="Paste encryption key"
              autoComplete="off"
              value={encryptionKey}
              onChange={(event) => {
                setEncryptionKey(event.target.value);
                setError("");
              }}
            />
          </div>

          {error && <p className="join-error">{error}</p>}

          <div className="join-info">
            <p>No account required</p>
          </div>

          <div className="join-info">
            <p>Your chat history stays on this device</p>
          </div>

          <button className="join-btn" onClick={handleJoinChat}>
            <span>Join Chat</span>
            <FiArrowRight />
          </button>
        </div>
      </div>
    </main>
  );
}

export default JoinChat;
