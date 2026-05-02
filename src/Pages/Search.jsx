import React, { useState, useEffect } from "react";
import { FaSearch, FaUserPlus, FaUserMinus } from "react-icons/fa";
import Navbar from "./Navbar/Navbar"; 
import "./Styling/search.css";

const API_URL = process.env.REACT_APP_API_URL ;
console.log("API_URL =", API_URL);

export default function Search() {
  const [searchInput, setSearchInput] = useState("");
  const [profileData, setProfileData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/all`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const filteredUsers = profileData.filter((item) => {
    return item.username?.toLowerCase().includes(searchInput.toLowerCase());
  });

  const handleToggleFriend = async (username, isCurrentlyFriend) => {
    const endpoint = isCurrentlyFriend ? `/unfriend/${username}` : `/add-friend/${username}`;

    setProfileData((prevData) => 
      prevData.map(user => 
        user.username === username ? { ...user, isFriend: !isCurrentlyFriend } : user
      )
    );

    try {
      const response = await fetch(`${API_URL}/api/users${endpoint}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Action failed");

    } catch (error) {
      console.error("Error toggling friend status:", error);
      alert("Action failed. Reverting...");
      setProfileData((prevData) => 
        prevData.map(user => 
          user.username === username ? { ...user, isFriend: isCurrentlyFriend } : user
        )
      );
    }
  };

  return (
    <div className="search-wrapper">
      <div className="search-header">
        <h2>Find Friends</h2>
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search usernames..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="search-results-container">
        {isLoading ? (
          <p className="no-results">Loading users...</p>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((item, index) => {
            return (
              <div key={index} className="user-card">
                <div className="user-info">
                  <img
                    src={item.profileUrl || "https://via.placeholder.com/150/E2E8F0/64748B?text=User"}
                    alt={`${item.username}'s avatar`}
                    className="user-avatar"
                  />
                  <span className="user-name">{item.username}</span>
                </div>

                <button
                  className={item.isFriend ? "unfriend-btn" : "add-friend-btn"}
                  onClick={() => handleToggleFriend(item.username, item.isFriend)}
                >
                  {item.isFriend ? <FaUserMinus className="btn-icon" /> : <FaUserPlus className="btn-icon" />}
                  <span className="btn-text">
                    {item.isFriend ? "Unfriend" : "Add"}
                  </span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="no-results">
            <p>No users found matching "{searchInput}"</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
}