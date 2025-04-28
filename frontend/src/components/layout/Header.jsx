import React, { useState } from 'react'
import LoginModal from '../login/LoginModal';
function Header() {
    const [role, setRole] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openLoginModal = (userRole) => {
        setRole(userRole);
        setIsModalOpen(true);  // Always default to login when opening modal
        //document.getElementById("login-modal").style.display = "flex";
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
          <li><a href="/">Home</a></li>
          <li><a href="/shop">Shop</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
        <button onClick={() => openLoginModal("employee")} className="login-button">
          Employee Login
        </button>
        <button onClick={() => openLoginModal("customer")} className="login-button">
          Login
        </button>
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