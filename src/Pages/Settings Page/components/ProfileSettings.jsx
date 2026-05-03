import React, { useState, useEffect } from "react";
import { FiCamera, FiX } from "react-icons/fi"; // <-- Import FiX here
import "./ProfileSettings.css";

const API_URL = "";
console.log("API_URL =", API_URL);

export default function ProfileSettings({ onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [profileUrl, setProfileUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. Fetch Current User Data on Mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();
        setFormData({
          username: data.username || "",
          email: data.email || "", 
        });
        setProfileUrl(data.profileUrl || "https://via.placeholder.com/150");
      } catch (error) {
        console.error("Error:", error);
        setMessage({ type: "error", text: "Could not load profile data." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 2. Handle Image Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileUrl(URL.createObjectURL(file));
    }
  };

  // 3. Handle Form Submission
  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const submitData = new FormData();
      submitData.append("username", formData.username);
      if (imageFile) {
        submitData.append("profileImage", imageFile);
      }

      const response = await fetch(`${API_URL}/api/users/update`, {
        method: "PUT",
        body: submitData,
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="ps-loading">Loading your profile...</div>;

  return (
    <div className="ps-container">
      {/* --- ADDED CLOSE BUTTON HERE --- */}
      <button className="ps-close-btn" onClick={onClose}>
        <FiX />
      </button>

      <h3>Edit Profile</h3>

      {message && (
        <div className={`ps-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="ps-avatar-section">
        <div className="ps-avatar-wrapper">
          <img src={profileUrl} alt="Profile Preview" className="ps-avatar" />
          <label className="ps-avatar-overlay">
            <FiCamera className="ps-camera-icon" />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: "none" }} 
            />
          </label>
        </div>
        <p className="ps-avatar-hint">Click the image to upload a new photo</p>
      </div>

      {/* Text Inputs */}
      <div className="ps-form-group">
        <label>Username</label>
        <input 
          type="text" 
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
      </div>

      {/* Action Buttons */}
      <div className="ps-actions">
        <button 
          className="ps-save-btn" 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}