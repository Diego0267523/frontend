import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import { SocketProvider } from "./context/SocketContext";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import "./index.css";

// 🔥 React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Global error handler
window.addEventListener("error", (event) => {
  console.error("🔥 GLOBAL ERROR:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("🔥 UNHANDLED PROMISE:", event.reason);
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <SocketProvider>
            <App />
          </SocketProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);