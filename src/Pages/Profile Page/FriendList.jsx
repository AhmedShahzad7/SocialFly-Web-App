import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import './FriendList.css';
import Navbar from '../Navbar/Navbar'; // Adjust path if needed!

export default function FriendList() {
  const [listFriends, setListFriends] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [allFriends, setAllFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  // Get friends from backend on mount
  useEffect(() => {
    const fetchFriendList = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/friends", {
          method: "GET",
          credentials: "include", // Required to send the secure cookie
        });

        if (!response.ok) {
          throw new Error("Failed to fetch friends");
        }

        const data = await response.json();
        
        // Data comes back as an array of objects: [{ _id, username, profileUrl }, ...]
        setListFriends(data);
        setAllFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendList();
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    if (searchInput.trim() === '') {
      setListFriends(allFriends);
    } else {
      const filtered = allFriends.filter(friend =>
        friend.username.toLowerCase().includes(searchInput.toLowerCase())
      );
      setListFriends(filtered);
    }
  }, [searchInput, allFriends]);

  return (
    <div className="friends-wrapper">
      
      {/* Header Section (Contains Title and Search) */}
      <div className="friends-header">
        <h1 className="header-title">Friends</h1>
        
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-bar"
            placeholder="Search Username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Overlapping the Header */}
      <div className="friends-content-container">
        <div className="unified-list-card">
          {isLoading ? (
            <div className="empty-state">
              <p>Loading friends...</p>
            </div>
          ) : listFriends.length > 0 ? (
            listFriends.map((item) => (
              <div key={item._id} className="friend-list-item">
                <div className="friend-avatar-wrapper">
                  <img
                    // Fallback to placeholder if no profileUrl exists
                    src={item.profileUrl || "https://via.placeholder.com/150/E2E8F0/64748B?text=User"}
                    alt={item.username}
                    className="friend-avatar"
                  />
                </div>
                <span className="friend-name">{item.username}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>
                {allFriends.length === 0 
                  ? "You haven't added any friends yet!" 
                  : `No friends found matching "${searchInput}"`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Added the Navbar so you can navigate back! */}
      <Navbar />
    </div>
  );
}