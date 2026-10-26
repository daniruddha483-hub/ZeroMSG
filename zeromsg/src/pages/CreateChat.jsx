import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiArrowRight } from "react-icons/fi";

import Navbar from "../components/Navbar";
import { generateEncryptionKey } from "../encryption.js";
import "./styles/CreateChat.css";

function CreateChat() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleCreateChat = async () => {
    try {
      const roomId = Math.random().toString(36).substring(2, 10);
      const key = await generateEncryptionKey();

      navigate(`/chat/${roomId}`, {
        state: {
          mode: "create",
          key,
        },
      });
    } catch {
      setError("Could not create an encrypted room. Please try again.");
    }
  };

  return (
    <main className="create-chat">
      <Navbar />

      <div className="create-content">
        <div className="create-card">
          <div className="create-header">
            <div className="create-icon">
              <FiPlus />
            </div>
            <h1>Create Chat</h1>
          </div>

          <p className="create-description">
            Start an encrypted room and invite someone using a secret link.
          </p>

          <div className="create-info">
            <p>No account required</p>
          </div>

          <div className="create-info">
            <p>Chat history stays on your device</p>
          </div>

          {error && <p className="chat-error">{error}</p>}

          <button className="create-btn" onClick={handleCreateChat}>
            <span>Create Chat</span>
            <FiArrowRight />
          </button>
        </div>
      </div>
    </main>
  );
}

export default CreateChat;
