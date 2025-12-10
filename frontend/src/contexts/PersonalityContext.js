// frontend/src/contexts/PersonalityContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const PersonalityContext = createContext();

export const usePersonality = () => useContext(PersonalityContext);

const defaultPersonality = {
  id: "calm-female",
  label: "Calm Female Counselor",
  systemStyle: "a calm, gentle female counselor who speaks softly and encourages self‑compassion.",
};

const PERSONALITY_KEY = "mw_personality";

export const PersonalityProvider = ({ children }) => {
  const [personality, setPersonality] = useState(defaultPersonality);

  // load from localStorage when app starts
  useEffect(() => {
    const saved = localStorage.getItem(PERSONALITY_KEY);
    if (saved) {
      setPersonality(JSON.parse(saved));
    }
  }, []);

  const updatePersonality = (p) => {
    setPersonality(p);
    localStorage.setItem(PERSONALITY_KEY, JSON.stringify(p));
  };

  return (
    <PersonalityContext.Provider value={{ personality, updatePersonality }}>
      {children}
    </PersonalityContext.Provider>
  );
};
