import React, { useState } from 'react';
import LoginModal from '../auth/LoginModal';
import { useAuth } from '../auth/AuthProvider';
import { NavLink } from "react-router-dom";

function Header() {

  const { handleLogout, currentUser } = useAuth();
  const [role, setRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openLoginModal = (userRole) => {
    setRole(userRole);
    setIsModalOpen(true);
    console.log(isModalOpen)
  };

  const closeLoginModal = () => {
    setIsModalOpen(false);
    console.log(isModalOpen)
  };


  return (
    <>
      <nav className="navbar">
        <div className="logo">FurniLux</div>
        <ul className="nav-links">
          <li><NavLink to="/" end> Home </NavLink></li>
          <li><NavLink to="/shop" end> Shop </NavLink></li>
          <li><NavLink to="/about" end> About </NavLink></li>
          <li><NavLink to="/contact" end> Contact </NavLink></li>
          <li><NavLink to="/customerTest" end> Customer-test </NavLink></li>
          <li><NavLink to="/adminTest" end> Admin-test </NavLink></li>
          <li><NavLink to="/manager-dashboard">Manager dashboard</NavLink></li>

        </ul>
        {/* <button onClick={() => openLoginModal("employee")} className="login-button">
          Employee Login
        </button> */}
        {currentUser ? <button onClick={() => handleLogout()}>
          Logout
        </button> :
          <button onClick={() => openLoginModal("customer")} className="login-button">
            Login
          </button>
        }
      </nav>
      {isModalOpen && (
        <LoginModal
          role={role}
          onClose={closeLoginModal}
        />)}
    </>
  )
}

export default Header