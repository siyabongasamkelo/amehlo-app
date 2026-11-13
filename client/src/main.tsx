import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./context/AppContext.tsx";
import { QueueProvider } from "./features/queue/context/QueueContext.tsx";
import { ServiceProvider } from "./features/services/context/ServiceContext.tsx";
// import { WorkspaceProvider } from "./features/branch/context/WorkspaceContext.tsx";
import { BranchProvider } from "./features/branch/context/BranchContext.tsx";
import { CompanyProvider } from "./features/company/context/CompanyContext.tsx";
import { StudentProvider } from "./features/student/context/StudentContext.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
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
          <StudentProvider>
            <CompanyProvider>
              <BranchProvider>
                <ServiceProvider>
                  <QueueProvider>
                    <App />
                  </QueueProvider>
                </ServiceProvider>
              </BranchProvider>
            </CompanyProvider>
          </StudentProvider>
        </AppProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>,
);
