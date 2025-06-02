// src/context/LoginModal.jsx
import React, { useState } from "react";
import { useAuth } from "./AuthProvider";
import { useCart } from "../../contexts/CartContext";  // <-- import your cart context hook
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginModal.css";

function CustomerLogin({ role = "customer", onClose }) {
  const { handleLogin } = useAuth();
  const { fetchCart } = useCart();   // <-- get fetchCart function from cart context
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (isLogin) {
      try {
        const params = new URLSearchParams();
        params.append("username", formData.email);
        params.append("password", formData.password);

        // Call backend customer login endpoint
        await axios.post("http://localhost:8000/users/login/customer", params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        // If login successful, call your frontend auth handler
        await handleLogin({
          username: formData.email,
          password: formData.password,
        });

        // <-- IMPORTANT: fetch cart right after login to update cart badge
        await fetchCart();

        if (onClose) onClose();
      } catch (err) {
        if (err.response?.status === 403) {
          setErrorMessage("Only customers are allowed to log in here.");
        } else if (err.response?.status === 401) {
          setErrorMessage("Incorrect email or password.");
        } else if (err.response?.status === 404) {
          setErrorMessage("User not found.");
        } else {
          setErrorMessage("Invalid credentials or access denied.");
        }
        console.error(err);
      }
    } else {
      // Signup logic remains unchanged
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role || "customer",
        is_active: true,
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.address && { address: formData.address }),
      };

      try {
        await axios.post("http://localhost:8000/users/signup", signupData);
        setErrorMessage("");
        if (onClose) onClose();
      } catch (error) {
        const detail = error.response?.data?.detail;
        if (detail?.includes("Email already exists")) {
          setErrorMessage("Email already exists");
        } else if (typeof detail === "string") {
          setErrorMessage(detail);
        } else {
          setErrorMessage(error.message);
        }
        console.error("Error during signup:", error);
      }
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrorMessage("");
  };

  return (
    <div id="login-modal" className="login-modal-overlay">
      <div className="login-modal">
        <h2>
          {isLogin
            ? `Log In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
            : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                placeholder="Full name"
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              required
              placeholder="Email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleFormChange}
              required
              placeholder="Password"
            />
          </div>

          {errorMessage && (
            <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
          )}

          <div className="form-actions">
            <button type="submit" className="login-submit">
              {isLogin ? "Log In" : "Sign Up"}
            </button>
            <button type="button" className="close-button" onClick={onClose}>
              Close
            </button>
          </div>
        </form>

        {role === "customer" && (
          <div className="toggle-form">
            <p>
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <span
                onClick={toggleForm}
                style={{ color: "#f39c12", cursor: "pointer" }}
              >
                {isLogin ? "Sign Up" : "Log In"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerLogin;
