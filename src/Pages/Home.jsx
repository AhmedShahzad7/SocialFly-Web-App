import React, { useState, useEffect } from "react";
import { FaRegHeart, FaHeart, FaRegComment, FaRegBell } from "react-icons/fa";
import Navbar from "./Navbar/Navbar";
import "./Styling/home.css";
import NotificationPopup from "./Notificationpopup/Notificationpopup";
import CommentsPopup from "./CommentsPopup/CommentsPopup";

const API_URL = process.env.REACT_APP_API_URL ;
console.log("API_URL =", API_URL);

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const currentUserId = document.cookie
    .split("; ")
    .find((row) => row.startsWith("userId="))
    ?.split("=")[1];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsRes = await fetch(`${API_URL}/api/posts/all`, {
          credentials: "include",
        });
        const postsData = await postsRes.json();
        setPosts(postsData);

        const notifRes = await fetch(
          `${API_URL}/api/users/notifications`,
          { credentials: "include" },
        );
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifCount(notifData.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const toggleLike = async (postId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/posts/like/${postId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        const updatedData = await response.json();
        setPosts(
          posts.map((post) => {
            if (post._id === postId) {
              return {
                ...post,
                likes: updatedData.isLiked
                  ? [...post.likes, currentUserId]
                  : post.likes.filter((id) => id.toString() !== currentUserId),
              };
            }
            return post;
          }),
        );
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const refreshNotifications = async () => {
    const notifRes = await fetch(
      `${API_URL}/api/users/notifications`,
      { credentials: "include" },
    );
    if (notifRes.ok) {
      const notifData = await notifRes.json();
      setNotifCount(notifData.length);
    }
  };

  if (loading) {
    return (
      <div className="home-wrapper">
        <h3>Loading feed...</h3>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <div
        className="home-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Feed</h2>

        <button
          className="header-bell-btn"
          onClick={() => setIsNotifOpen(true)}
          style={{
            background: "none",
            border: "none",
            fontSize: "22px",
            color: "#1E293B",
            cursor: "pointer",
            position: "relative",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            width: "50px",
          }}
        >
          <FaRegBell />
          {notifCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "0px",
                right: "0px",
                background: "#E11D48",
                color: "white",
                fontSize: "10px",
                fontWeight: "bold",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #FFFFFF",
              }}
            >
              {notifCount}
            </span>
          )}
        </button>
      </div>

      {isNotifOpen && (
        <NotificationPopup
          onClose={() => setIsNotifOpen(false)}
          onActionComplete={refreshNotifications}
        />
      )}
      {activeCommentPostId && (
        <CommentsPopup
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

      <div className="feed-container">
        {posts.map((post) => {
          const isLikedByMe = post.likes.some(
            (id) => id.toString() === currentUserId,
          );

          return (
            <div key={post._id} className="feed-post-card">
              <div className="post-header">
                <img
                  src={
                    post.user?.profileUrl ||
                    "https://via.placeholder.com/150/E2E8F0/64748B?text=User"
                  }
                  alt={post.user?.username || "User"}
                  className="post-avatar"
                />
                <div className="post-header-info">
                  <span className="post-username">
                    {post.user?.username || "Unknown User"}
                  </span>
                  <span className="post-date">{post.post_date}</span>
                </div>
              </div>

              <div className="post-content">
                {post.post_type === "txt" ? (
                  <p className="post-text">{post.post_txt}</p>
                ) : (
                  <div className="post-image-wrapper">
                    <img
                      src={post.post_url}
                      alt="Post content"
                      className="post-image"
                    />
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button
                  className={`action-btn like-btn ${isLikedByMe ? "liked" : ""}`}
                  onClick={() => toggleLike(post._id)}
                >
                  {isLikedByMe ? (
                    <FaHeart
                      className="action-icon filled"
                      style={{ color: "#E11D48" }}
                    />
                  ) : (
                    <FaRegHeart className="action-icon" />
                  )}
                  <span className="action-count">{post.likes.length}</span>
                </button>

                <button
                  className="action-btn comment-btn"
                  onClick={() => setActiveCommentPostId(post._id)}
                >
                  <FaRegComment className="action-icon" />
                  <span className="action-count">
                    {post.comments ? post.comments.length : 0}
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        <div className="end-of-feed">
          <p>You've caught up on all posts!</p>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
