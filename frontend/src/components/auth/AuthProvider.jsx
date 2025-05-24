// src/context/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Set base URL for axios
axios.defaults.baseURL = "http://localhost:8000";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedLogin = localStorage.getItem("isLoggedIn");
    const storedRole = localStorage.getItem("userRole");

    if (storedToken && storedLogin === "true") {
      setToken(storedToken);
      setIsLoggedIn(true);
      setUserRole(storedRole || null);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
  }, []);

  const handleLogin = async ({ username, password }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post("http://localhost:8000/users/login", formData, {
  headers: { "Content-Type": "application/x-www-form-urlencoded" }
});

      const token = response.data.access_token;
      const role = response.data.role || "customer"; // adjust based on your backend

      setToken(token);
      setIsLoggedIn(true);
      setUserRole(role);
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return response.data; // return whole data including role
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, token, userRole, handleLogin, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
