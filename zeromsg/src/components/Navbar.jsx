import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiPlus,
  FiLogIn,
  FiSettings,
} from "react-icons/fi";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <span className="navbar-dot"></span>
        ZeroMSG
      </Link>

      <div className={`navbar-links ${menuOpen ? "menu-open" : ""}`}>
        <NavLink to="/" end onClick={closeMenu}>
          <FiHome />
          <span>Home</span>
        </NavLink>

        <NavLink to="/create" onClick={closeMenu}>
          <FiPlus />
          <span>Create</span>
        </NavLink>

        <NavLink to="/join" onClick={closeMenu}>
          <FiLogIn />
          <span>Join</span>
        </NavLink>

        <NavLink to="/settings" onClick={closeMenu}>
          <FiSettings />
          <span>Settings</span>
        </NavLink>
      </div>

      <button
        className="navbar-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>
    </nav>
  );
}

export default Navbar;
