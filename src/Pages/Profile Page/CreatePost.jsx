import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPenTool, FiImage, FiType, FiUploadCloud } from "react-icons/fi";
import "./CreatePost.css";

const API_URL = process.env.REACT_APP_API_URL ;
console.log("API_URL =", API_URL);

export default function CreatePost() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState("txt");
  const [postText, setPostText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageName, setImageName] = useState("No file chosen");
  const [currentUname, setCurrentUname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const TEXT_LIMIT = 60;

  // Web Image Picker Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageName(file.name);
    }
  };

  

  // Submit Handler
const submitPost = async () => {
    setIsSubmitting(true);
    const currentDate = new Date();
    const stringDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    try {
      const formData = new FormData();
      formData.append("post_type", postType);
      formData.append("post_date", stringDate);
      // Removed formData.append("username", currentUname); -> Backend handles it now!

      if (postType === "img" && imageFile) {
        formData.append("image", imageFile); 
      } else if (postType === "txt" && postText.trim() !== "") {
        formData.append("post_txt", postText);
      } else {
        alert("Please fill out the post content before submitting.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/posts/create`, {
        method: "POST",
        body: formData, 
        credentials: "include", // <--- CRITICAL: This sends the cookie!
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to upload post");
      }

      alert("Successfully uploaded the post!");
      navigate("/profile");

    } catch (error) {
      console.error("Error submitting post:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-wrapper">
      {/* Header Background */}
      <div className="cp-header-background"></div>

      <div className="cp-container">
        {/* Title Section */}
        <div className="cp-title-box">
          <FiPenTool className="cp-title-icon" />
          <h1 className="cp-title-text">Create Post</h1>
        </div>

        {/* Main Interactive Card */}
        <div className="cp-card">
          
          <div className="cp-card-header">
            <h3>Post Type</h3>
          </div>

          {/* Modern Segmented Toggle for Post Type */}
          <div className="type-toggle-container">
            <button
              className={`toggle-btn ${postType === "txt" ? "active" : ""}`}
              onClick={() => setPostType("txt")}
            >
              <FiType className="toggle-icon" /> Text
            </button>
            <button
              className={`toggle-btn ${postType === "img" ? "active" : ""}`}
              onClick={() => setPostType("img")}
            >
              <FiImage className="toggle-icon" /> Image
            </button>
          </div>

          {/* Dynamic Content Area */}
          <div className="cp-content-area">
            {postType === "txt" ? (
              <div className="text-input-wrapper">
                <textarea
                  className="cp-textarea"
                  placeholder="What's on your mind?"
                  value={postText}
                  onChange={(e) => {
                    if (e.target.value.length <= TEXT_LIMIT) {
                      setPostText(e.target.value);
                    }
                  }}
                />
                <div className={`char-counter ${postText.length === TEXT_LIMIT ? "limit-reached" : ""}`}>
                  {postText.length} / {TEXT_LIMIT}
                </div>
              </div>
            ) : (
              <div className="image-input-wrapper">
                <div className="file-upload-box">
                  <FiUploadCloud className="upload-icon" />
                  <span className="file-name">{imageName}</span>
                  {/* Hidden standard file input triggered by the label */}
                  <label className="upload-btn">
                    Browse Files
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="cp-action-row">
            <button 
              className="cp-submit-btn" 
              onClick={submitPost}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit Post"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}