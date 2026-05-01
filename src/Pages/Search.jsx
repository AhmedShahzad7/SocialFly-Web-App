import { useState, useEffect } from "react";
import "./Styling/search.css";
import authService from "../services/authService";

export default function Search() {
  const [searchInput, setSearchInput] = useState("");
  const [profileData, setProfileData] = useState([]);

  const getAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/test"); // temp API
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const filteredUsers = profileData.filter((item) => {
  return (
    item.username?.toLowerCase().includes(searchInput.toLowerCase()) &&
    item.username !== currentUser?.username   
  );
});

  // 🔹 Send friend request (dummy for now)
  const sendFriendRequest = async (username) => {
    try {
      alert(`Friend request sent to ${username}`);
      // later: call backend API
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="search-container">

      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Enter Username"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className="profile-container">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((item, index) => (
            <div key={index} className="profile-item">

              <img
                src={item.profileUrl || "https://via.placeholder.com/50"}
                alt="profile"
                className="profile-image"
              />

              <span className="profile-text">{item.username}</span>

              <button
                className="add-friend-btn"
                onClick={() => sendFriendRequest(item.username)}
              >
                Add Friend
              </button>

            </div>
          ))
        ) : (
          <p className="no-users">No usernames found</p>
        )}
      </div>

    </div>
  );
}