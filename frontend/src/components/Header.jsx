import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';  // Adjust path if needed
import { FaShoppingCart } from 'react-icons/fa';
import './Header.css';
import LoginModal from './auth/LoginModal'; 
import { useAuth } from './auth/AuthProvider';

export default function Header() {
  const { handleLogout, isLoggedIn, userRole } = useAuth();  // use isLoggedIn & userRole from context
  const { cartQuantity } = useCart();

  const [role, setRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openLoginModal = (userRole) => {
    setRole(userRole);
    setIsModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">FurniStyle</Link>
          </div>

          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/products">Shop</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/customerTest">Customer Test</NavLink>
            <NavLink to="/adminTest">Admin Test</NavLink>
            <NavLink to="/manager-dashboard">Manager Dashboard</NavLink>  
          </nav>

          {/* Cart icon and badge */}
          <div className="cart-icon-wrapper" title="View Cart">
            <Link to="/cart" className="cart-link">
              <FaShoppingCart size={24} />
              {cartQuantity > 0 && (
                <span className="cart-badge">{cartQuantity}</span>
              )}
            </Link>
          </div>

          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <span className="user-role">{userRole}</span>
                <button onClick={handleLogout} className="btn login-btn">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => openLoginModal("customer")} className="btn login-btn">Login</button>
                <Link to="/register" className="btn register-btn">Register</Link>
              </>
            )}
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
