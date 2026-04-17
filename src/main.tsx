import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { useAuthStore } from "@/store/auth/auth.store";
import "./index.css";

useAuthStore.getState().hydrateSession();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);