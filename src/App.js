import React, { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Stories from "./pages/Stories";

import { AuthContext } from "./context/AuthContext";

function App() {
  const authContext = useContext(AuthContext);
  const { token } = authContext || {};

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

  if (!authContext) {
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
    </BrowserRouter>
  );
}

export default App;