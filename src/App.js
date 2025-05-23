import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import WebcamCropper from './components/WebcamCropper';
import ChatBot from './components/ChatBot';
import { isSessionValid, clearSession } from './utils/session';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true to bypass login
  const [activeTab, setActiveTab] = useState('camera');
  const [isMobile, setIsMobile] = useState(false);
  const [latestAnswer, setLatestAnswer] = useState(null);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(false);
  };

  // Comment out the login check
  /*
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }
  */

  return (
    <div className="App">
      <div className="tab-container">
        <button
          className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          Camera
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className="tab-button logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="content-container">
        {activeTab === 'camera' ? (
          <WebcamCropper 
            switchToChat={(answer) => {
              setLatestAnswer(answer);
              setActiveTab('chat');
            }} 
            isMobile={isMobile} 
          />
        ) : (
          <ChatBot initialAnswer={latestAnswer} />
        )}
      </div>
    </div>
  );
}

export default App;
