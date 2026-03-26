import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";


import { AuthContext } from "./context/AuthContext";

function App() {
  const { token } = useContext(AuthContext) || {};

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
            <Route path="/profile" element={<Profile />} /> {/* 🔥 AÑADIDO */}
          </>
        )}

        {/* 🔥 fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;