import React, { useEffect, useRef, useReducer } from 'react';
import './DMThread.css';
import { dmReducer, initialState } from '../dmreducer';

const API_URL = "https://socialfly-web-app2-production.up.railway.app";

const DMThread = ({ friend, goBack }) => {
  const [state, dispatch] = useReducer(dmReducer, initialState);
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

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
          <button onClick={goBack}>Back</button>
          <h2>Loading chat...</h2>
        </header>
      </div>
    );
  }

  return (
    <div className="dm-wrapper">
      <header className="dm-header">
        <button onClick={goBack}>Back</button>
        <h2>{friend.username}</h2>
      </header>

      <main className="dm-messages-container">
        {state.messages.map((msg) => {
          const isFriend = msg.sender === friend.id;

          return (
            <div key={msg._id} className={isFriend ? 'received' : 'sent'}>
              <p>{msg.text}</p>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <form onSubmit={handleSend}>
        <input
          type="text"
          value={state.messageText}
          onChange={(e) =>
            dispatch({ type: "SET_TEXT", payload: e.target.value })
          }
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default DMThread;