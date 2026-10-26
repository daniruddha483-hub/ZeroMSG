import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "./styles/Home.css";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <main className="home">
      <Navbar />
      <div className="home-content">
        <div className="home-card">
          <div className="brand">
            <span className="brand-dot"></span>
            <h1>ZeroMSG</h1>
          </div>

          <p className="tagline">Your chats belong to your device.</p>

          <p className="description">
            Private messaging without accounts, sign-ups, or unnecessary data
            collection.
          </p>

          <div className="home-actions">
            <Link to="/create" className="primary-btn">
              Create Chat
            </Link>

            <Link to="/join" className="secondary-btn">
              Join Chat
            </Link>
          </div>

          <div className="privacy-note">
            <span className="status-dot"></span>
            <div>
              <strong>Stored Locally</strong>
              <p>Your chat history stays on your device.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default Home;
