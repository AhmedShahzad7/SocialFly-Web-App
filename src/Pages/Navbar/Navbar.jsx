import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaSearch, FaComments, FaCog, FaUser } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${isActive("/home") ? "active" : ""}`} 
        onClick={() => navigate("/home")}
      >
        <FaHome className="nav-icon" />
        <span className="nav-text">Home</span>
      </div>

      <div 
        className={`nav-item ${isActive("/search") ? "active" : ""}`} 
        onClick={() => navigate("/search")}
      >
        <FaSearch className="nav-icon" />
        <span className="nav-text">Search</span>
      </div>

      <div 
        className={`nav-item ${isActive("/chat") ? "active" : ""}`} 
        onClick={() => navigate("/chat")}
      >
        <FaComments className="nav-icon" />
        <span className="nav-text">Chat</span>
      </div>

      <div 
        className={`nav-item ${isActive("/settings") ? "active" : ""}`} 
        onClick={() => navigate("/settings")}
      >
        <FaCog className="nav-icon" />
        <span className="nav-text">Settings</span>
      </div>

      <div 
        className={`nav-item ${isActive("/profile") ? "active" : ""}`} 
        onClick={() => navigate("/profile")}
      >
        <FaUser className="nav-icon" />
        <span className="nav-text">Profile</span>
      </div>
    </div>
  );
}