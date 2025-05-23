// ChatBot.jsx
import React, { useEffect, useState } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Check if there's an answer stored in sessionStorage
    const storedAnswer = sessionStorage.getItem('chatAnswer');
    if (storedAnswer) {
      const answerMessage = JSON.parse(storedAnswer);
      setMessages((prev) => [...prev, answerMessage]);
      sessionStorage.removeItem('chatAnswer'); // Clear after using
    }
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    const botResponse = { from: 'bot', text: 'This is a static bot response.' };

    setMessages((prev) => [...prev, userMessage, botResponse]);
    setInput('');
  };

  return (
    <div className="center-wrapper">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.from}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
