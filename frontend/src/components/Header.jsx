import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { FaShoppingCart, FaLock } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";

import "./Header.css";
import LoginModal from "./auth/LoginModal";
import CustomerLogin from "./auth/CustomerLogin"; // import new wrapper
import { useAuth } from "./auth/AuthProvider";

export default function Header() {
  const { handleLogout, currentUser } = useAuth();
  const { cartQuantity, fetchCart } = useCart();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New state for customer-only login modal
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);

  const openLoginModal = (userRole) => {
    setRole(userRole);
    setIsModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const isEmployee = currentUser && currentUser.role && currentUser.role !== "customer";
  const isCustomer = currentUser && currentUser.role && currentUser.role == "customer";

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">FurniStyle</Link>
          </div>

          <nav className="nav-links">
            {isEmployee ? (
              <NavLink to={`${currentUser.role}-dashboard`}>Dashboard</NavLink>
            ) : (
              <NavLink to="/shop-products">Shop</NavLink>
              
            )}
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>

            {isCustomer && (
              <NavLink to="/orders">Orders</NavLink>
            )}
            
          </nav>

          <div className="header-icons">
            {/* Cart icon and badge */}
            {(!currentUser || currentUser.role === "customer") && (
  <div
    className={`cart-icon-wrapper ${
      currentUser && currentUser.role === "customer" ? "logged-in" : ""
    }`}
    title={
      !currentUser
        ? "Please log in to access your cart"
        : `View Cart (${cartQuantity} items)`
    }
    style={{ cursor: "pointer", position: "relative" }}
    onClick={(e) => {
      if (!currentUser) {
        e.preventDefault();
        setIsCustomerLoginOpen(true);
      }
    }}
  >
    <Link
      to={currentUser && currentUser.role === "customer" ? "/cart" : "#"}
      className="cart-link"
      onClick={(e) => {
        if (!currentUser) e.preventDefault();
      }}
    >
      <FaShoppingCart size={24} />
      {!currentUser ? (
        <span className="cart-badge no-background">
          <FaLock size={15} />
        </span>
      ) : cartQuantity > 0 ? (
        <span className="cart-badge">{cartQuantity}</span>
      ) : null}
      <label className="cart-label">Current Cart Insight</label>
    </Link>
  </div>
)}

            
            <div className="auth-buttons">
              {currentUser ? (
                <button
                  onClick={() => {
                    handleLogout();
                    navigate("/");
                  }}
                  className="btn login-btn"
                >
                  <FaSignOutAlt size={20} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openLoginModal("customer")}
                    className="btn login-btn"
                  >
                    Login
                  </button>
                  <Link to="/register" className="btn register-btn">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* General login modal (for header login button) */}
      {isModalOpen && <LoginModal role={role} onClose={closeLoginModal} />}

      {/* Customer-only login modal (for cart icon login) */}
      {isCustomerLoginOpen && (
        <CustomerLogin onClose={() => setIsCustomerLoginOpen(false)} />
      )}
    </>
  );
}