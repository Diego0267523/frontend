import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import  API_URL from "../utils/config"; 

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    return stored && stored !== "null" && stored !== "undefined"
      ? stored
      : null;
  });

  const [user, setUser] = useState(null);

 
  
  

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
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data);

    } catch (error) {
      console.error("ERROR PROFILE:", error.response?.data || error.message);
      // Si el token es inválido, hacer logout automático
      if (error.response?.status === 401) {
        logout();
      }
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