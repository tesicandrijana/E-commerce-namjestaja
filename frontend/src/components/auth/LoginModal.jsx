import React, { useState } from 'react';
import axios from 'axios';
import {useAuth} from './AuthProvider';

function LoginModal({ role, onClose }) {

  const {handleLogin} = useAuth()
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
/*     username: "",
 */    password: "",
    email: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLogin) {
      const data = {
        username: formData.email,
        password: formData.password
      }
      try {
        const response = await handleLogin(data);
        console.log(`Logging in as ${role} with`, response);
        onClose()
      } catch (err) {
        console.log(err);
      }
    } else {
      // Send signup data to backend (add role to form data for signup)
      const signupData = {
        ...formData,
        role: "customer", // Set role to 'customer' when signing up
      };
      try {
        await axios.post("http://localhost:8000/users/signup", signupData);
        console.log(`Signing up as ${role} with`, formData);
      } catch (error) {
        console.error("Error during signup:", error.response?.data || error);
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
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
          {isLogin ? null : ( <>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
          
          {/* <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleFormChange}
              required
            />
          </div> */}
          </>
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
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="login-submit">
              {isLogin ? "Log In" : "Sign Up"}
            </button>
            <button
              type="button"
              className="close-button"
              onClick={() => onClose()}
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
