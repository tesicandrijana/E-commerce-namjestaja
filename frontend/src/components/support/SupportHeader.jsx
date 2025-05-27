// src/components/support/SupportHeader.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../auth/AuthProvider";
import "./SupportHeader.css";

const SupportHeader = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="support-header">
      <div className="support-header-container">
        <Link to="/support-dashboard" className="support-logo">
          FurniStyle - Employee
        </Link>
        <nav className="support-nav">
           {/* <Link to="/support">Dashboard</Link> */}
          <Link to="/support/profile">My profile</Link>
          <Link to="/support/complaints">Complaints</Link>
          <button onClick={() => { handleLogout(); navigate("/"); }} className="support-logout">
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SupportHeader;
