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
          <Link to="/support/profile" className="support-btn profile-btn">My Profile</Link>
          <Link to="/support/complaints" className="support-btn complaints-btn">Complaints</Link>
          <button onClick={() => { handleLogout(); navigate("/"); }} className="support-btn logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SupportHeader;
