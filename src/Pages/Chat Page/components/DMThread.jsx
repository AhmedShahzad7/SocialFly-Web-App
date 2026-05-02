import React, { useState, useEffect, useRef } from 'react';
import './DMThread.css';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DMThread = ({ friend, goBack }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chats/${friend.id}`, {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/chats/send`, {
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
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessageText(""); 
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
      <header className="dm-header">
        <div className="dm-header-left">
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

      <main className="dm-messages-container">
        {messages.map((msg) => {
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
        <div ref={messagesEndRef} />
      </main>

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