import React, {useState} from 'react'

function LoginModal({ role, onClose }) {

  const [isLogin, setIsLogin] = useState(true);

  /* const openLoginModal = (userRole) => {
      setRole(userRole);
      setIsLogin(true);  // Always default to login when opening modal
      document.getElementById("login-modal").style.display = "flex";
    }; */

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
  return (
    <div id="login-modal" className="login-modal-overlay" >
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
                <span onClick={toggleForm} style={{ color: "#f39c12", cursor: "pointer" }}>
                  {isLogin ? "Sign Up" : "Log In"}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
  )
}

export default LoginModal