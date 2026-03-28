import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Stories from "./pages/Stories";
import ChatAssistant from "./components/ChatAssistant";
import FloatingChatBubble from "./components/FloatingChatBubble";

import { useAuth } from "./hooks/useAuth";

function App() {
  const { token, profileLoading } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  // Detectar desconexión de red
  useEffect(() => {
    const handleOffline = () => {
      console.warn("⚠️ Sin conexión a internet");
    };
    const handleOnline = () => {
      console.log("✅ Conexión restaurada");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (profileLoading) {
    return <div style={{ color: "#fff", padding: "20px" }}>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 SIEMPRE DISPONIBLE */}
        <Route path="/register" element={<Register />} />

        {!token ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/stories" element={<Stories />} />
          </>
        )}

        {/* 🔥 fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

      {token && (
        <>
          <FloatingChatBubble
            isOpen={chatOpen}
            onClick={() => setChatOpen((prev) => !prev)}
          />
          {chatOpen && (
            <div
              style={{
                position: "fixed",
                left: 16,
                bottom: 90,
                zIndex: 1900,
                width: 350,
                maxWidth: "calc(100vw - 32px)",
                transform: "translateY(0)",
                pointerEvents: "auto"
              }}
            >
              <ChatAssistant onClose={() => setChatOpen(false)} />
            </div>
          )}
        </>
      )}

    </BrowserRouter>
  );
}

export default App;