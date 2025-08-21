// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Auth } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        // Check if user has completed onboarding (you might store this in Firestore)
        // For now, we'll assume they need onboarding
        setIsOnboarded(false);
      } else {
        // User is signed out
        setUser(null);
        setIsOnboarded(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsOnboarded(false);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    // You might want to update Firestore here to mark onboarding as complete
  };

  const value = {
    user,
    isOnboarded,
    isLoading,
    logout: handleLogout,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};