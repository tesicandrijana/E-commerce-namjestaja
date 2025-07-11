import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useCart } from "../../contexts/CartContext"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginModal.css";

function LoginModal({ role = "customer", onClose }) {
  const { handleLogin } = useAuth();
  const { fetchCart } = useCart(); 
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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

  // Switch to sign-up mode if Register button dispatches event
  useEffect(() => {
    const handleOpenSignup = () => setIsLogin(false);
    document.addEventListener("open-signup", handleOpenSignup);
    return () => document.removeEventListener("open-signup", handleOpenSignup);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (isLogin) {
      try {
        const response = await handleLogin({
          username: formData.email,
          password: formData.password,
        });

        // Fetch cart after successful login
        await fetchCart();

        const userRole = response.role || role;

        // Redirect based on role
        if (userRole === "admin") {
          navigate("/admin-dashboard");
        } else if (userRole === "manager") {
          navigate("/manager-dashboard");
        } else if (userRole === "support") {
          navigate("/support"); // No dashboard for support
        } else if (userRole === "delivery") {
          navigate("/delivery-dashboard");
        } else {
          navigate("/"); // Default: homepage
        }

        onClose();
      } catch (err) {
        setErrorMessage("Invalid credentials");
        console.log(err);
      }
    } else {
      // Sign up
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
        onClose(); // Close modal after successful sign-up
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
            ? `Log In`
            : `Sign Up`}
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

export default LoginModal;
