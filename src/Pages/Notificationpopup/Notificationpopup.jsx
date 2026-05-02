import React, { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import "./NotificationPopup.css"; // Check your casing here based on your file structure

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function NotificationPopup({ onClose, onActionComplete }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/notifications`, {
          credentials: "include"
        });
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Handle Accept or Decline
  const handleAction = async (requesterId, action) => {
    try {
      const response = await fetch(`${API_URL}/api/users/handle-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId, action }),
        credentials: "include"
      });

      if (response.ok) {
        // Remove from the UI list instantly
        setRequests(requests.filter(req => req._id !== requesterId));
        // Tell the Home page to update the red badge number
        if (onActionComplete) onActionComplete();
      }
    } catch (error) {
      console.error(`Error trying to ${action} request:`, error);
    }
  };

  return (
    <div className="np-overlay" onClick={onClose}>
      <div className="np-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="np-header">
          <h3>Notifications</h3>
          <button className="np-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="np-body">
          <h4 className="np-section-title">Friend Requests</h4>
          
          {loading ? (
             <p className="np-empty">Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="np-list">
              {requests.map((req) => (
                <div key={req._id} className="np-item">
                  <div className="np-user-info">
                    <img 
                      src={req.profileUrl || "https://via.placeholder.com/150/E2E8F0/64748B?text=User"} 
                      alt={req.username} 
                      className="np-avatar"
                    />
                    <span className="np-username">{req.username}</span>
                  </div>
                  
                  <div className="np-actions">
                    <button 
                      className="np-btn accept" 
                      onClick={() => handleAction(req._id, "accept")}
                      title="Accept"
                    >
                      <FiCheck />
                    </button>
                    <button 
                      className="np-btn decline" 
                      onClick={() => handleAction(req._id, "decline")}
                      title="Decline"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="np-empty">No new notifications.</p>
          )}
        </div>

      </div>
    </div>
  );
}