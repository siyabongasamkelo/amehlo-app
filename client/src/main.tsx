import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Make sure your CSS file is imported!
import App from "./App";
import { AppProvider } from "./context/AppContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <AppProvider>
        <App />
      </AppProvider>
    </>
  </React.StrictMode>,
);
