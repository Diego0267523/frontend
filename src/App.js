import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import UserProfilePage from "./pages/UserProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
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

function AppRoutes({ token }) {
  const location = useLocation();
  const [dmsOpen, setDmsOpen] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);

  useEffect(() => {
    const handleChatVisibility = (event) => {
      setChatHidden(Boolean(event?.detail?.hidden));
    };

    window.addEventListener("app:chat-visibility", handleChatVisibility);
    return () => {
      window.removeEventListener("app:chat-visibility", handleChatVisibility);
    };
  }, []);

  const shouldHideFloatingChat = !token || location.pathname !== "/" || chatHidden;

  useEffect(() => {
    if (shouldHideFloatingChat && dmsOpen) {
      setDmsOpen(false);
    }
  }, [dmsOpen, shouldHideFloatingChat]);

  return (
    <>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/register" element={<Register />} />
        <Route path="/perfil/:username" element={<PublicProfilePage />} />

        {!token ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            {/* RUTAS PRIVADAS */}
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/app/u/:username" element={<UserProfilePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>

      {token && (
        <>
          <FloatingChatBubble
            hidden={shouldHideFloatingChat}
            isOpen={dmsOpen}
            onClick={() => setDmsOpen((prev) => !prev)}
          />
          <AnimatePresence mode="wait">
            {dmsOpen && !shouldHideFloatingChat && (
              <motion.div
                key="direct-messages"
                style={{
                  position: "fixed",
                  right: 16,
                  bottom: 90,
                  zIndex: 1900,
                  width: 350,
                  maxWidth: "calc(100vw - 32px)",
                  pointerEvents: "auto",
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
    </>
  );
}

function App() {
  const { token, profileLoading } = useAuth();

  useEffect(() => {
    const handleOffline = () => console.warn("⚠️ Sin conexión a internet");
    const handleOnline = () => console.log("✅ Conexión restaurada");
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (profileLoading) return <ProfessionalLoader message="Iniciando sesión..." />;

  return (
    <BrowserRouter>
      <AppRoutes token={token} />
    </BrowserRouter>
  );
}

export default App;