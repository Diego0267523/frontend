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
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const profileRetryCount = React.useRef(0);

  // ==========================
  // 🔐 LOGIN
  // ==========================
  const login = (newToken) => {
    setToken(newToken);
    setProfileError(null);
    localStorage.setItem("token", newToken);
  };

  // ==========================
  // 🚪 LOGOUT
  // ==========================
  const logout = () => {
    setToken(null);
    setUser(null);
    setProfileError(null);
    localStorage.removeItem("token");
  };

  // ==========================
  // 👤 GET PROFILE
  // ==========================
  const getProfile = React.useCallback(async () => {
    if (!token || profileLoading || profileError) {
      return;
    }

    setProfileLoading(true);

    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data);
      setProfileError(null);
      profileRetryCount.current = 0;

    } catch (error) {
      console.error("ERROR PROFILE:", error.response?.data || error.message);
      const status = error.response?.status;

      if (status === 401) {
        logout();
      } else if (status === 429) {
        setProfileError('rate-limit');
        profileRetryCount.current = 0;
        // Si hay 429, esperamos 60s antes de dejar de bloquear, para no generar otro 429.
        setTimeout(() => {
          setProfileError(null);
        }, 60000);
      } else {
        setProfileError('unknown');
      }
    } finally {
      setProfileLoading(false);
    }
  }, [token, profileLoading, profileError]);

  // ==========================
  // 🔄 AUTO LOAD PROFILE
  // ==========================
  useEffect(() => {
    if (token && !user && !profileLoading && !profileError) {
      getProfile();
    }
  }, [token, user, profileLoading, profileError, getProfile]);

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