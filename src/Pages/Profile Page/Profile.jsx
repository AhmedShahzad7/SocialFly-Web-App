import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaArrowDown,
  FaHome,
  FaSearch,
  FaComments,
  FaCog,
  FaUser,
} from "react-icons/fa";
import "./Profile.css";
import Navbar from "../Navbar//Navbar";

const API_URL = "https://socialfly-web-app2-production.up.railway.app" ;
console.log("API_URL =", API_URL);
export default function Profile() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [username, setUsername] = useState("Loading...");
  const [profileUrl, setProfileUrl] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/users/profile`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (response.status === 401) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();

        setUsername(data.username);
        setProfileUrl(data.profileUrl);
        setPostCount(data.postCount);
        setFriendCount(data.friendCount);
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="profile-wrapper">
      {/* Soft gradient background header */}
      <div className="profile-header-background"></div>

      <div className="profile-container">
        {/* Top Action Row */}
        <div className="action-row">
          <button
            className="btn-primary"
            onClick={() => navigate("/create-post")}
          >
            <FaPlus className="btn-icon" />
            <span>Create Post</span>
          </button>
        </div>

        {/* User Info Card */}
        <div className="user-info-card">
          <div className="avatar-container">
            <img
              src={
                profileUrl ||
                "https://via.placeholder.com/150/E2E8F0/64748B?text=User"
              }
              alt={`${username}'s avatar`}
              className="avatar-img"
            />
          </div>

          <div className="user-details">
            <h2 className="username">{username}</h2>

            <div className="user-stats">
              <div className="stat-box">
                <span className="stat-number">{postCount}</span>
                <span className="stat-label">Posts</span>
              </div>

              <div
                className="stat-box clickable-stat"
                onClick={() => navigate("/friend-list")}
              >
                <span className="stat-number">{friendCount}</span>
                <span className="stat-label">Friends</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section Header */}
        <div className="section-header">
          <h3>Your Posts</h3>
          <FaArrowDown className="header-icon" />
        </div>

        {/* Posts Grid */}
        <div className="posts-grid">
          {posts.length > 0 ? (
            posts.map((row, index) => (
              <div key={index} className="post-card">
                {row.post_type === "txt" ? (
                  <div className="post-text-content">
                    <p>{row.post_txt}</p>
                  </div>
                ) : (
                  <img
                    src={row.post_url}
                    alt="Post content"
                    className="post-image-content"
                  />
                )}
              </div>
            ))
          ) : (
            <p style={{ color: "#64748B", fontWeight: 500 }}>
              No posts yet. Go create one!
            </p>
          )}
        </div>
      </div>
      <Navbar />
    </div>
  );
}
