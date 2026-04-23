import { auth } from '../firebase';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const SESSION_KEY = 'session_timestamp';

// Session timestamp set කරනවා — login වෙනකොට call කරන්න
export const setSessionTimestamp = () => {
  localStorage.setItem(SESSION_KEY, Date.now().toString());
};

export const clearSessionTimestamp = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const isSessionExpired = () => {
  const timestamp = localStorage.getItem(SESSION_KEY);
  if (!timestamp) return true;
  return Date.now() - parseInt(timestamp) > SESSION_DURATION_MS;
};

export const getAuthToken = async () => {
  try {
    const user = await new Promise((resolve) => {
      if (auth.currentUser !== undefined) {
        resolve(auth.currentUser);
        return;
      }
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (user) {
      return await user.getIdToken(false);
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const isAuthenticated = () => auth.currentUser !== null;
export const getCurrentUserId = () => auth.currentUser?.uid || null;