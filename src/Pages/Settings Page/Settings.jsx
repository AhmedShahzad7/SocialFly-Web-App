import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoPersonOutline,
  IoHeartOutline,
  IoHelpCircleOutline,
  IoLogOutOutline,
  IoSettingsOutline,
  IoCloseOutline,
} from "react-icons/io5";
import Navbar from "../Navbar/Navbar"; // Assuming you want the navbar here!
import "./Settings.css";
import ProfileSettings from "./components/ProfileSettings";
import LikedPosts from "./components/LikedPosts";
export default function Settings() {
  const navigate = useNavigate();
  // State to track which popup is currently open (null means none are open)
  const [activeModal, setActiveModal] = useState(null);

  // We replaced 'path' with 'modalId'
  const menuItems = [
    { icon: <IoPersonOutline />, label: "Profile Detail", modalId: "profile" },
    { icon: <IoHeartOutline />, label: "Liked Posts", modalId: "liked" },
    { icon: <IoHelpCircleOutline />, label: "About", modalId: "about" },
    { icon: <IoLogOutOutline />, label: "Logout", modalId: "logout" },
  ];

  const handleMenuClick = (modalId) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Dedicated logout handler for when they confirm in the popup
  const confirmLogout = () => {
    // Clear cookies/local storage here
    alert("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="settings-wrapper">
      {/* Main Settings Content */}
      <div className="settings-container">
        <div className="settings-header">
          <IoSettingsOutline className="header-icon" />
          <h2>Settings</h2>
        </div>

        <div className="menu-container">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={() => handleMenuClick(item.modalId)}
            >
              <div className="menu-item-left">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 
        --- POPUP OVERLAY SYSTEM --- 
        If activeModal is NOT null, render the dark overlay and the popup box
      */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          {/* Prevent clicks inside the modal from closing it */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
           

            {/* Render different components based on which modal is active */}
            {activeModal === "profile" && (
              <ProfileSettings onClose={closeModal} />
            )}

            {activeModal === "liked" && (
              <LikedPosts onClose={closeModal}/>
            )}

            {activeModal === "about" && (
              <div className="placeholder-component">
                <h3>About SocialFly</h3>
                <p>Version 1.0.0. Industrial Standard Web App.</p>
              </div>
            )}

            {activeModal === "logout" && (
              <div className="logout-confirmation">
                <h3>Are you sure?</h3>
                <p>You will be returned to the login screen.</p>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="confirm-btn" onClick={confirmLogout}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Navbar */}
      <Navbar />
    </div>
  );
}
