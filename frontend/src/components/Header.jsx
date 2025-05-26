import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';  // relative path from components to contexts
import { FaShoppingCart } from 'react-icons/fa';
import { FaSignOutAlt } from "react-icons/fa";

import './Header.css';
import LoginModal from './auth/LoginModal';
import { useAuth } from './auth/AuthProvider';

export default function Header() {
  const { handleLogout, currentUser } = useAuth();
  const { cartQuantity } = useCart(); // get total cart quantity
  const navigate = useNavigate()
  const [role, setRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openLoginModal = (userRole) => {
    setRole(userRole);
    setIsModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsModalOpen(false);
  };

  const isEmployee = currentUser && currentUser.role && currentUser.role !== 'customer';


  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">FurniStyle</Link>
          </div>

          <nav className="nav-links">
            {
              isEmployee ?
                <NavLink to={`${currentUser.role}-dashboard`}>Dashboard</NavLink> :
                <NavLink to="/products">Shop</NavLink>
            }
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>

          </nav >
            <div className="header-icons">
          {/* Cart icon and badge */}
          {currentUser?.role === "customer"?
            <div className="cart-icon-wrapper" title="View Cart">

              <Link to="/cart" className="cart-link">
                <FaShoppingCart size={24} />
                {cartQuantity > 0 && (
                  <span className="cart-badge">{cartQuantity}</span>
                )}
              </Link>
            </div>
            :
            null
          }

          <div className="auth-buttons">
            {currentUser ? (
              <button onClick={() => {handleLogout(); navigate("/");}} className="btn login-btn">  <FaSignOutAlt size={20} />
</button>
            ) : (
              <>
                <button onClick={() => openLoginModal("customer")} className="btn login-btn">Login</button>
                <Link to="/register" className="btn register-btn">Register</Link>
              </>
            )}
          </div>
          </div>
        </div>
      </header>

      {isModalOpen && (
        <LoginModal
          role={role}
          onClose={closeLoginModal}
        />
      )}
    </>
  );
}
