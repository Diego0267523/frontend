import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

import { AuthContext } from "./context/AuthContext";

function App() {
  const { token } = useContext(AuthContext) || {};

  return (
    <BrowserRouter>
      <Routes>

        {!token ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default App;