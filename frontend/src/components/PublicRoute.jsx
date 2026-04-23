import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../firebase';
import { isSessionExpired } from '../utils/authUtils';

const PublicRoute = () => {
  // null  = Firebase hasn't told us yet (loading)
  // false = not logged in or session expired
  // true  = logged in and session valid
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !isSessionExpired()) {
        setIsAuth(true);
      } else {
        setIsAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Still waiting for Firebase to restore session
  if (isAuth === null) return null;

  // If already authenticated and session is valid, redirect to home
  if (isAuth === true) {
    return <Navigate to="/home-page" replace />;
  }

  // Otherwise, allow access to public routes (Login/Signup)
  return <Outlet />;
};

export default PublicRoute;
