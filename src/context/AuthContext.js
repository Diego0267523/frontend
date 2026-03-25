import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    return stored && stored !== "null" && stored !== "undefined"
      ? stored
      : null;
  });

  const [user, setUser] = useState(null);

 
  // 🔥 CAMBIA esto cuando deployes:
  const API = "https://tu-backend.onrender.com/api";

  // ==========================
  // 🔐 LOGIN
  // ==========================
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  // ==========================
  // 🚪 LOGOUT
  // ==========================
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  // ==========================
  // 👤 GET PROFILE
  // ==========================
  const getProfile = async () => {
    try {
      const res = await axios.get(`${API}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data.data);

    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      logout(); // 🔥 si falla → cerrar sesión
    }
  };

  // ==========================
  // 🔄 AUTO LOAD PROFILE
  // ==========================
  useEffect(() => {
    if (token) {
      getProfile();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        getProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}