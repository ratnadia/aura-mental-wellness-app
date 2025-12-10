// frontend/src/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  signInAnonymously,
  onAuthStateChanged,
} from "../firebase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start anonymous sign‑in
    signInAnonymously(auth).catch((err) => {
      console.error("Anonymous sign‑in error:", err);
    });

    // Listen for auth state changes
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
