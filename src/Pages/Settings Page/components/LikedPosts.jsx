import React, { useState, useEffect } from "react";
import { FiX, FiHeart } from "react-icons/fi";
import "./LikedPosts.css";

const API_URL = "https://socialfly-web-app2-production.up.railway.app";
console.log("API_URL =", API_URL);

export default function LikedPosts({ onClose }) {
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Real Liked Posts from Backend
  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/posts/liked`, {
          method: "GET",
          credentials: "include", // Essential for reading the userId cookie
        });

        if (!response.ok) {
          throw new Error("Failed to fetch liked posts");
        }

        const data = await response.json();
        setLikedPosts(data);
      } catch (error) {
        console.error("Error loading liked posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedPosts();
  }, []);

  return (
    <div className="lp-container">
      {/* Close Button */}
      <button className="lp-close-btn" onClick={onClose}>
        <FiX />
      </button>

      <div className="lp-header">
        <FiHeart className="lp-header-icon" />
        <h3>Liked Posts</h3>
      </div>

      <div className="lp-content">
        {isLoading ? (
          <div className="lp-loading">Loading your favorite posts...</div>
        ) : likedPosts.length > 0 ? (
          <div className="lp-scroll-area">
            {likedPosts.map((post) => (
              <div key={post._id} className="lp-card">
                
                <div className="lp-card-header">
                  {/* Safely dig into the populated user object */}
                  <img 
                    src={post.user?.profileUrl || "https://via.placeholder.com/150/E2E8F0/64748B?text=User"} 
                    alt={post.user?.username || "User"} 
                    className="lp-avatar" 
                  />
                  <div className="lp-user-info">
                    <span className="lp-username">{post.user?.username || "Unknown User"}</span>
                    <span className="lp-date">{post.post_date}</span>
                  </div>
                </div>

                <div className="lp-card-body">
                  {post.post_type === "txt" ? (
                    <p className="lp-text-snippet">{post.post_txt}</p>
                  ) : (
                    <img src={post.post_url} alt="Post snippet" className="lp-img-snippet" />
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="lp-empty">
            <p>You haven't liked any posts yet. Go spread some love on the feed!</p>
          </div>
        )}
      </div>
    </div>
  );
}