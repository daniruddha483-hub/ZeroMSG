import { useState } from "react";
import { FiHardDrive, FiTrash2, FiShield } from "react-icons/fi";

import Navbar from "../components/Navbar";
import "./styles/Settings.css";

function Settings() {
  const [message, setMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const handleClearChatData = () => {
    setConfirmAction("clear");
  };

  const handleDeleteAllData = () => {
    setConfirmAction("delete");
  };

  const confirmActionHandler = () => {
    if (confirmAction === "clear") {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("zeromsg-chat-"))
        .forEach((key) => localStorage.removeItem(key));

      setMessage("All saved conversations have been cleared.");
    }

    if (confirmAction === "delete") {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("zeromsg-"))
        .forEach((key) => localStorage.removeItem(key));

      setMessage("All ZeroMSG data has been deleted.");
    }

    setConfirmAction(null);
  };

  return (
    <main className="settings-page">
      <Navbar />

      <div className="settings-content">
        <section className="settings-card">
          <header className="settings-header">
            <div>
              <h1>Settings</h1>
              <p>Manage your local ZeroMSG data.</p>
            </div>
          </header>

          <div className="settings-section">
            <div className="section-title">
              <FiHardDrive />
              <span>Local Storage</span>
            </div>

            <div className="storage-card">
              <div>
                <strong>Your chats stay on this device</strong>

                <p>
                  ZeroMSG currently stores your conversation history in your
                  browser's local storage.
                </p>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-title">
              <FiShield />
              <span>Privacy</span>
            </div>

            <div className="privacy-card">
              <ul>
                <li>No account required.</li>
                <li>Chat history stays in your browser.</li>
                <li>Messages are encrypted using AES-GCM.</li>
                <li>The server relays encrypted messages.</li>
                <li>
                  Anyone with your invite link can access its encryption key.
                </li>
                <li>Rooms are deleted when everyone disconnects.</li>
              </ul>
            </div>
          </div>

          <div className="settings-section danger-section">
            <div className="section-title">
              <FiTrash2 />
              <span>Data Management</span>
            </div>

            <button className="settings-action" onClick={handleClearChatData}>
              <div>
                <strong>Clear Chat Data</strong>
              </div>
            </button>

            <button
              className="settings-action danger"
              onClick={handleDeleteAllData}
            >
              <div>
                <strong>Delete All Local Data</strong>
              </div>
            </button>
          </div>

          {message && <div className="settings-message">{message}</div>}

          <div className="settings-footer">
            <span>ZeroMSG</span>
            <span>Local-first messaging</span>
          </div>
        </section>
      </div>
      {confirmAction && (
        <div className="settings-confirm-overlay">
          <div
            className={`settings-confirm-box ${
              confirmAction === "delete" ? "danger-confirm" : ""
            }`}
          >
            <h3>
              {confirmAction === "clear"
                ? "Clear Chat Data?"
                : "Delete All Data?"}
            </h3>

            <p>
              {confirmAction === "clear"
                ? "Clear all saved chat conversations from this device?"
                : "Delete all ZeroMSG data from this device? This cannot be undone."}
            </p>

            <div className="settings-confirm-actions">
              <button
                className="settings-cancel-btn"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>

              <button
                className="settings-confirm-btn"
                onClick={confirmActionHandler}
              >
                {confirmAction === "clear" ? "Clear" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Settings;
