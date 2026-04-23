import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth, logout } from '../firebase';
import { isSessionExpired, clearSessionTimestamp } from '../utils/authUtils';

const CHECK_INTERVAL_MS = 60 * 1000; // check every 60 seconds

const ProtectedRoute = () => {
  // null  = Firebase hasn't told us yet (loading)
  // false = definitely not logged in
  // true  = logged in and session valid
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    // onAuthStateChanged fires once immediately with the restored user (or null).
    // This is the correct way to read Firebase auth state — never auth.currentUser
    // synchronously on first render, as it's null while Firebase initializes.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setAuthState(false);
        return;
      }

      if (isSessionExpired()) {
        clearSessionTimestamp();
        logout();
        setAuthState(false);
        return;
      }

      setAuthState(true);
    });

    return () => unsubscribe();
  }, []);

  // Set up the 60-second polling interval once we know the user is authenticated
  useEffect(() => {
    if (authState !== true) return;

    const interval = setInterval(() => {
      if (isSessionExpired()) {
        clearSessionTimestamp();
        logout().then(() => {
          window.location.href = '/login';
        });
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [authState]);

  // Still waiting for Firebase to restore session — render nothing
  if (authState === null) return null;

  // Session expired or not logged in
  if (authState === false) return <Navigate to="/login" replace />;

  // Session is valid — render the child route
  return <Outlet />;
};

export default ProtectedRoute;

