import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./context/AppContext.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log("Publishable Key:", PUBLISHABLE_KEY);
if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Clerk Publishable Key in frontend environment configuration.",
  );
}

// ➔ Create the rock-solid Query Engine instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't hammer the DB if a sync fails
      refetchOnWindowFocus: false, // Prevent unwanted background sync triggers
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <App />
        </AppProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>,
);
