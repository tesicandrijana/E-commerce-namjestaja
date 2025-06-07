import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { FaShoppingCart, FaLock, FaBell, FaSignOutAlt } from "react-icons/fa";

import "./Header.css";
import LoginModal from "./auth/LoginModal";
import CustomerLogin from "./auth/CustomerLogin";
import { useAuth } from "./auth/AuthProvider";

export default function Header() {
  const { handleLogout, currentUser } = useAuth();
  const { cartQuantity, fetchCart } = useCart();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);

  // New state to hold assigned complaints for notifications
  const [assignedComplaints, setAssignedComplaints] = useState([]);

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

  // Fetch assigned complaints for customer notification
  useEffect(() => {
    if (currentUser && currentUser.role === "customer") {
      fetch("http://localhost:8000/complaints/assigned", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important to send cookies for auth
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch complaints");
          return res.json();
        })
        .then((data) => {
          setAssignedComplaints(data || []);
        })
        .catch(() => setAssignedComplaints([]));
    } else {
      setAssignedComplaints([]);
    }
  }, [currentUser]);

  const isEmployee = currentUser && currentUser.role && currentUser.role !== "customer";
  const isCustomer = currentUser && currentUser.role && currentUser.role === "customer";

  const hasAssignedComplaints = assignedComplaints.length > 0;
  const firstComplaintId = hasAssignedComplaints ? assignedComplaints[0].id : null;

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

            {isCustomer && <NavLink to="/orders">Orders</NavLink>}
          </nav>

          <div className="header-icons">
            {/* Notification bell for assigned complaints */}
            {isCustomer && hasAssignedComplaints && (
              <div
                title="You have a new complaint message"
                onClick={() => navigate(`/customer/chat/${firstComplaintId}`)}
                style={{ cursor: "pointer", position: "relative", marginRight: "20px" }}
              >
                <FaBell size={24} color="red" />
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-10px",
                    backgroundColor: "red",
                    borderRadius: "50%",
                    color: "white",
                    padding: "2px 7px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {assignedComplaints.length}
                </span>
              </div>
            )}

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
