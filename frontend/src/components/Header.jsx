import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { FaShoppingCart, FaLock, FaSignOutAlt } from "react-icons/fa";
import { BsChatSquareText } from "react-icons/bs";
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
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

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

  useEffect(() => {
    if (currentUser && currentUser.role === "customer") {
      fetch("http://localhost:8000/complaints/assigned", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch complaints");
          return res.json();
        })
        .then((data) => setAssignedComplaints(data || []))
        .catch(() => setAssignedComplaints([]));
    } else {
      setAssignedComplaints([]);
    }
  }, [currentUser]);

  const isEmployee = currentUser && currentUser.role && currentUser.role !== "customer";
  const isCustomer = currentUser && currentUser.role === "customer";
  const hasAssignedComplaints = assignedComplaints.length > 0;

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">FurniStyle</Link>
          </div>

          <nav className="nav-links">
            {isEmployee ? (
              <NavLink to={`/${currentUser.role}-dashboard`}>Dashboard</NavLink>
            ) : (
              <NavLink to="/shop-products">Shop</NavLink>
            )}
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {isCustomer && <NavLink to="/orders">Orders</NavLink>}
          </nav>

          <div className="header-icons">
            {isCustomer && hasAssignedComplaints && (
              <div
                className="complaint-bell"
                onClick={() => setComplaintModalOpen(true)}
                title="You have assigned complaints"
              >
                <BsChatSquareText size={24} className="complaint-icon" />
                <span className="complaint-badge">{assignedComplaints.length}</span>
              </div>
            )}

            {(!currentUser || currentUser.role === "customer") && (
              <div
                className={`cart-icon-wrapper ${currentUser ? "logged-in" : ""}`}
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    setIsCustomerLoginOpen(true);
                  }
                }}
                title={
                  !currentUser
                    ? "Please log in to access your cart"
                    : `View Cart (${cartQuantity} items)`
                }
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
                isCustomer ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      navigate("/");
                    }}
                    className="btn login-btn"
                  >
                    Logout 
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLogout();
                      navigate("/");
                    }}
                    className="btn login-btn"
                    title="Logout"
                  >
                    <FaSignOutAlt size={20} />
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={() => openLoginModal("customer")}
                    className="btn login-btn"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setRole("customer");
                      setIsModalOpen(true);
                      setTimeout(() => {
                        document.dispatchEvent(new CustomEvent("open-signup"));
                      }, 0);
                    }}
                    className="btn register-btn"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {isModalOpen && <LoginModal role={role} onClose={closeLoginModal} />}
      {isCustomerLoginOpen && <CustomerLogin onClose={() => setIsCustomerLoginOpen(false)} />}

      {complaintModalOpen && (
        <div className="complaint-modal-backdrop" onClick={() => setComplaintModalOpen(false)}>
          <div className="complaint-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Customer Support</h3>
            <p className="complaint-modal-message">
              You have active complaints that are being handled by our support team.
              Would you like to view them and continue chatting with us?
            </p>

            <div className="complaint-modal-buttons">
              <button
                className="btn complaint-view-btn"
                onClick={() => {
                  navigate("/customer/complaints");
                  setComplaintModalOpen(false);
                }}
              >
                View Complaints & Chat
              </button>
              <button
                className="btn complaint-close-btn"
                onClick={() => setComplaintModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
