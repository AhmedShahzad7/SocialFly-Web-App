import React, { useEffect, useRef, useReducer } from "react";
import "./DMThread.css";
import { dmReducer, initialState } from "../dmreducer";

const API_URL = "https://socialfly-web-app2-production.up.railway.app";

const DMThread = ({ friend, goBack }) => {
  const [state, dispatch] = useReducer(dmReducer, initialState);
  const messagesEndRef = useRef(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chats/${friend.id}`, {
          credentials: "include",
        });
        const data = await res.json();

        dispatch({ type: "SET_MESSAGES", payload: data });
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    if (friend?.id) fetchMessages();
  }, [friend.id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!state.messageText.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/chats/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          receiverId: friend.id,
          text: state.messageText,
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        dispatch({ type: "ADD_MESSAGE", payload: newMessage });
        dispatch({ type: "CLEAR_TEXT" });
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (state.loading) {
    return (
      <div className="dm-wrapper">
        <header className="dm-header">
          <button className="back-btn" onClick={goBack}>
            Back
          </button>
          <h2>Loading chat...</h2>
        </header>
      </div>
    );
  }

  return (
    <div className="dm-wrapper">
      {/* HEADER */}
      <header className="dm-header">
        <div className="dm-header-left">
          <button className="back-btn" onClick={goBack}>
            ⬅
          </button>
          <div className="dm-header-info">
            <h2>{friend.username}</h2>
            <span className="dm-status">Online</span>
          </div>
        </div>
      </header>

      {/* MESSAGES */}
      <main className="dm-messages-container">
        {state.messages.map((msg) => {
          const isFriend = msg.sender === friend.id;

          return (
            <div
              key={msg._id}
              className={`message-row ${isFriend ? "received" : "sent"}`}
            >
              <div className="message-content">
                <div className="message-bubble">
                  <p>{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* INPUT */}
      <div className="dm-input-area">
        <div className="dm-input-container">
          <form className="dm-form" onSubmit={handleSend}>
            <input
              className="dm-text-input"
              type="text"
              placeholder="Type a message..."
              value={state.messageText}
              onChange={(e) =>
                dispatch({ type: "SET_TEXT", payload: e.target.value })
              }
            />
            <button
              className="send-btn"
              type="submit"
              disabled={!state.messageText.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DMThread;