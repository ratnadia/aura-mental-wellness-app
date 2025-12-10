import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
import { PersonalityProvider } from "./contexts/PersonalityContext";

root.render(
  <React.StrictMode>
    <AuthProvider>
      <PersonalityProvider>
        <App />
      </PersonalityProvider>
    </AuthProvider>
  </React.StrictMode>
);
