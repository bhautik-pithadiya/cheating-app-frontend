import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'app_session_id';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const createSession = () => {
  const sessionId = uuidv4();
  const sessionData = {
    id: sessionId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_EXPIRY
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return sessionId;
};

export const getSession = () => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;

  const session = JSON.parse(sessionData);
  if (Date.now() > session.expiresAt) {
    // Session expired
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  return session;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const isSessionValid = () => {
  const session = getSession();
  return session !== null;
}; 