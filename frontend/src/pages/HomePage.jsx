import React, { useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      console.log(`Logging in as ${role} with`, formData);
    } else {
      console.log(`Signing up as ${role} with`, formData);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const openLoginModal = (userRole) => {
    setRole(userRole);
    setIsLogin(true);  // Always default to login when opening modal
    document.getElementById("login-modal").style.display = "flex";
  };

  return (
    <div className="home-container">
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

      <section className="hero">
        <div className="hero-text">
          <h1>Elevate Your Space with Our Premium Furniture</h1>
          <p>Discover stylish furniture for every room, crafted with comfort and elegance in mind.</p>
          <a href="/shop" className="shop-button">Shop Now</a>
        </div>
        <div className="hero-image">
          <img
            src="https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg"
            alt="Modern living room"
          />
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <img src="https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg" alt="Luxury Chair" />
          <h3>Timeless Design</h3>
          <p>We blend comfort, quality, and style into timeless furniture pieces.</p>
        </div>
        <div className="feature-card">
          <img
            src="https://ak1.ostkcdn.com/images/products/is/images/direct/94559ce073cff53d9dbe3813bb05427d166646ef/31.29%22Modern-Retro-Splicing-Round-Coffee-Table.jpg?imwidth=714&impolicy=medium"
            alt="Wooden Table"
          />
          <h3>Premium Materials</h3>
          <p>Crafted with sustainably sourced wood and high-end materials.</p>
        </div>
        <div className="feature-card">
          <img src="https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg" alt="Cozy Sofa" />
          <h3>Customer First</h3>
          <p>Enjoy fast delivery, responsive support, and a seamless experience.</p>
        </div>
      </section>

      {/* Login Modal */}
      <div id="login-modal" className="login-modal-overlay" style={{ display: "none" }}>
        <div className="login-modal">
          <h2>
            {isLogin
              ? `Log In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
              : `Sign Up as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                required
              />
            </div>
            {isLogin || role === "employee" ? null : (
              <div className="input-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
            )}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="login-submit">
                {isLogin ? "Log In" : "Sign Up"}
              </button>
              <button
                type="button"
                className="close-button"
                onClick={() => document.getElementById("login-modal").style.display = "none"}
              >
                Close
              </button>
            </div>
          </form>

          {/* Sign Up toggle only for customers */}
          {role === "customer" && (
            <div className="toggle-form">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span onClick={toggleForm} style={{ color: "#f39c12", cursor: "pointer" }}>
                  {isLogin ? "Sign Up" : "Log In"}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

