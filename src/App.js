import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Stories from "./pages/Stories";
import DirectMessages from "./components/DirectMessages";
import FloatingChatBubble from "./components/FloatingChatBubble";
import ProfessionalLoader from "./components/ProfessionalLoader";

import { useAuth } from "./hooks/useAuth";
import { pageTransitionVariants } from "./utils/motion-variants";
// Debe ir antes de cualquier middleware que use express-rate-limit
app.set('trust proxy', 1); // confía en 1 proxy (Render / Vercel)
function App() {
  const { token, profileLoading } = useAuth();
  const [dmsOpen, setDmsOpen] = useState(false);

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
    return <ProfessionalLoader message="Iniciando sesión..." />;
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
            isOpen={dmsOpen}
            onClick={() => setDmsOpen((prev) => !prev)}
          />
          <AnimatePresence mode="wait">
            {dmsOpen && (
              <motion.div
                key="direct-messages"
                style={{
                  position: "fixed",
                  right: 16,
                  bottom: 90,
                  zIndex: 1900,
                  width: 350,
                  maxWidth: "calc(100vw - 32px)",
                  pointerEvents: "auto"
                }}
                variants={pageTransitionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <DirectMessages onClose={() => setDmsOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

    </BrowserRouter>
  );
}

export default App;