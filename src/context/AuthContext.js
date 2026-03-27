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
  const profileRetryCount = React.useRef(0);

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
    if (!token || profileLoading) {
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
      profileRetryCount.current = 0;

    } catch (error) {
      console.error("ERROR PROFILE:", error.response?.data || error.message);
      const status = error.response?.status;

      if (status === 401) {
        logout();
      } else if (status === 429) {
        // Evitar bloqueo total por rate-limiter; reintentar con backoff.
        if (profileRetryCount.current < 3) {
          const delay = 2000 * (profileRetryCount.current + 1);
          profileRetryCount.current += 1;
          setTimeout(() => {
            getProfile();
          }, delay);
        }
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // ==========================
  // 🔄 AUTO LOAD PROFILE
  // ==========================
  useEffect(() => {
    if (token && !user && !profileLoading) {
      getProfile();
    }
  }, [token, user, profileLoading]);

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