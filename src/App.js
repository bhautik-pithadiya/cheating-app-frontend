import React, { useState } from 'react';
import WebcamCropper from './components/WebcamCropper';
import ChatBot from './components/ChatBot';
import Login from './components/Login';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' or 'chat'
  const [latestAnswer, setLatestAnswer] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  console.log('App rendered, isLoggedIn:', isLoggedIn);

  // Called from WebcamCropper after getting answer
  const handleSwitchToChat = (answer) => {
    setLatestAnswer(answer);
    setActiveTab('chat');
  };

  if (!isLoggedIn) {
    console.log('Rendering Login component');
    return <Login onLogin={setIsLoggedIn} />;
  }

  console.log('Rendering main app content');
  return (
    <div className="app-wrapper">
      <div className="toggle-buttons" style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            backgroundColor: activeTab === 'chat' ? '#2563eb' : '#ccc',
            color: activeTab === 'chat' ? 'white' : 'black',
            padding: '8px 16px',
            marginRight: '8px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          style={{
            backgroundColor: activeTab === 'camera' ? '#2563eb' : '#ccc',
            color: activeTab === 'camera' ? 'white' : 'black',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Camera
        </button>
      </div>

      {activeTab === 'camera' && <WebcamCropper switchToChat={handleSwitchToChat} />}
      {activeTab === 'chat' && <ChatBot initialAnswer={latestAnswer} />}
    </div>
  );
};

export default App;
