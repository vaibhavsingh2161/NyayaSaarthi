import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { Menu } from "lucide-react";
import "../styles/NavbarAdv.css";

const NavbarAdv = ({ logo, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="dashboard-header">
      <Link to="/">
        <img src={logo} alt="NyayaSarthi Logo" className="logo" />
      </Link>

      <nav className={`dashboard-nav ${menuOpen ? "open" : ""}`}>
        <Link
          to="/advocate-dashboard"
          className={
            location.pathname === "/advocate-dashboard" ? "active" : ""
          }
        >
          Dashboard
        </Link>
        <Link
          to="/nyaya-sanhita"
          className={location.pathname === "/nyaya-sanhita" ? "active" : ""}
        >
          Nyaya Sanhita
        </Link>
        <Link
          to="/floating-case"
          className={location.pathname === "/floating-case" ? "active" : ""}
        >
          Floating Case
        </Link>
        <Link
          to="/profile"
          className={location.pathname === "/profile" ? "active" : ""}
        >
          Profile
        </Link>
        <button onClick={handleLogout} className="logout-button">
          <FaSignOutAlt /> Logout
        </button>
      </nav>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <Menu size={24} />
      </button>
    </header>
  );
};

export default NavbarAdv;
