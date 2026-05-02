import React, { useState, useEffect } from "react";
import { FiX, FiSend } from "react-icons/fi";
import "./CommentsPopup.css";

export default function CommentsPopup({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/comments/${postId}`, {
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Failed to load comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleSend = async () => {
    if (!newComment.trim()) return;

    const commentText = newComment;
    setNewComment(""); 

    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });

    try {
      const response = await fetch(`http://localhost:5000/api/posts/comment/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText, date: currentDate }),
        credentials: "include"
      });

      if (response.ok) {
        const addedComment = await response.json();
        setComments((prev) => [...prev, addedComment]);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="cp-overlay" onClick={onClose}>
      <div className="cp-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="cp-header">
          <h3>Comments</h3>
          <button className="cp-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="cp-body">
          {isLoading ? (
            <div className="cp-loading">Loading comments...</div>
          ) : comments.length > 0 ? (
            <div className="cp-list">
              {comments.map((comment) => (
                <div key={comment._id} className="cp-item">
                  <img 
                    src={comment.user?.profileUrl || "https://via.placeholder.com/150/E2E8F0/64748B?text=User"} 
                    alt={comment.user?.username || "User"} 
                    className="cp-avatar"
                  />
                  <div className="cp-text-bubble">
                    <div className="cp-item-header">
                      <span className="cp-username">{comment.user?.username || "Unknown"}</span>
                      <span className="cp-date">{comment.date}</span>
                    </div>
                    <p className="cp-text">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cp-empty">Be the first to comment!</div>
          )}
        </div>

        <div className="cp-footer">
          <input 
            type="text" 
            placeholder="Write a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="cp-input"
          />
          <button 
            className="cp-send-btn" 
            onClick={handleSend}
            disabled={!newComment.trim()}
          >
            <FiSend />
          </button>
        </div>

      </div>
    </div>
  );
}