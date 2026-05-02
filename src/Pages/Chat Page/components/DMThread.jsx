import React, { useState, useEffect, useRef } from 'react';
import './DMThread.css';

const DMThread = ({ friend, goBack }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Ref to automatically scroll to the newest message
  const messagesEndRef = useRef(null);

  // 1. FETCH CHAT HISTORY
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chats/${friend.id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (friend?.id) {
      fetchMessages();
    }
  }, [friend.id]);

  // 2. AUTO-SCROLL TO BOTTOM
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. SEND A MESSAGE
  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/api/chats/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiverId: friend.id,
          text: messageText,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        // Instantly append the new message to the screen
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageText(""); // Clear input
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return (
      <div className="dm-wrapper">
        <header className="dm-header">
          <div className="dm-header-left">
            <button className="back-btn" onClick={goBack}>Back</button>
            <h2>Loading chat...</h2>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="dm-wrapper">
      {/* DM Header */}
      <header className="dm-header">
        <div className="dm-header-left">
          {/* Using goBack() passed from ChatPage to return to Inbox */}
          <button className="back-btn" aria-label="Go back" onClick={goBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <img src={friend.avatar} alt={friend.username} className="dm-header-avatar" />
          <div className="dm-header-info">
            <h2>{friend.username}</h2>
            <span className="dm-status">{friend.status}</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="dm-messages-container">
        {messages.map((msg) => {
          // If the sender ID matches the friend's ID, it's received. Otherwise, it's sent by you.
          const isFriend = msg.sender === friend.id;
          
          return (
            <div key={msg._id} className={`message-row ${isFriend ? 'received' : 'sent'}`}>
              {isFriend && (
                <img src={friend.avatar} alt="avatar" className="message-avatar" />
              )}
              <div className="message-content">
                <div className="message-bubble">
                  <p>{msg.text}</p>
                </div>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {/* Invisible div to help us scroll to the bottom */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="dm-input-area">
        <div className="dm-input-container">
          <button className="attach-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          
          <form onSubmit={handleSend} className="dm-form">
            <input 
              type="text" 
              placeholder="Message..." 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="dm-text-input"
            />
            <button type="submit" className="send-btn" disabled={!messageText.trim()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default DMThread;