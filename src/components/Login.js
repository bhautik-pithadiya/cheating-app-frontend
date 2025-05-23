import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  console.log('Login component rendered');
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Static credentials
  const validUsername = 'admin';
  const validPassword = 'password123';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', credentials);
    if (credentials.username === validUsername && credentials.password === validPassword) {
      console.log('Login successful');
      onLogin(true);
      setError('');
    } else {
      console.log('Login failed');
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Login</button>
        </form>
        <div className="credentials-info">
          <p>Demo Credentials:</p>
          <p>Username: admin</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 