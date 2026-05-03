import React, { useState, useEffect } from 'react';
import './ChatPage.css';
import DMThread from './components/DMThread'; 

const API_URL = "";
console.log("API_URL =", API_URL);

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chats/inbox`, {
          credentials: "include",
        });

        const data = await res.json();
        setRecentChats(data);
      } catch (err) {
        console.error("Error fetching inbox:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, []);

  const handleStartNewChat = (friend) => {
    setIsModalOpen(false); 
    setSearchQuery("");    
    setActiveChat(friend); 
  };

  const filteredFriends = recentChats.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeChat) {
    return (
      <DMThread 
        friend={activeChat} 
        goBack={() => setActiveChat(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="chat-wrapper">
        <h3>Loading chats...</h3>
      </div>
    );
  }

  return (
    <div className="chat-wrapper">
      <header className="chat-header">
        <h2>Messages</h2>
        <button 
          className="new-message-btn" 
          aria-label="New Message"
          onClick={() => setIsModalOpen(true)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </header>

      <main className="chat-container">
        <div className="chat-list">
          {recentChats.map((chat) => (
            <div
              key={chat.id}
              className="chat-list-item"
              onClick={() => setActiveChat(chat)}
            >
              <img src={chat.avatar} alt={chat.username} className="chat-avatar" />

              <div className="chat-details">
                <div className="chat-top-row">
                  <span className="chat-username">{chat.username}</span>
                  <span className="chat-timestamp">
                    {chat.timestamp
                      ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ""}
                  </span>
                </div>

                <div className="chat-bottom-row">
                  <p className={`chat-last-message ${chat.unread > 0 ? "unread-text" : ""}`}>
                    {chat.lastMessage}
                  </p>

                  {chat.unread > 0 && (
                    <span className="chat-unread-badge">{chat.unread}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalOpen && (
        <div className="new-chat-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Message</h3>
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-search">
              <input 
                type="text" 
                placeholder="Search friends..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-friends-list">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div 
                    key={friend.id} 
                    className="modal-friend-item"
                    onClick={() => handleStartNewChat(friend)}
                  >
                    <img src={friend.avatar} alt={friend.username} />
                    <span>{friend.username}</span>
                  </div>
                ))
              ) : (
                <p className="no-friends-msg">No friends found matching "{searchQuery}"</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;