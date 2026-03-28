import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import  API_URL from "../utils/config"; 

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    return stored && stored !== "null" && stored !== "undefined" ? stored : null;
  });

  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileFetched, setProfileFetched] = useState(false);
  const profileRateLimitTimer = React.useRef(null);
  const isMounted = React.useRef(true);
  // ==========================
  // 🔐 LOGIN
  // ==========================
  const login = (newToken) => {
    setToken(newToken);
    setProfileError(null);
    setProfileFetched(false);
    setUser(null);
    localStorage.setItem("token", newToken);
    localStorage.removeItem("user");
  };

  // ==========================
  // 🚪 LOGOUT
  // ==========================
  const logout = () => {
    setToken(null);
    setUser(null);
    setProfileError(null);
    setProfileFetched(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ==========================
  // 👤 GET PROFILE
  // ==========================
  const getProfile = React.useCallback(async () => {
    if (!token || profileLoading || profileFetched || profileError === 'rate-limit') {
      return;
    }

    setProfileLoading(true);

    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!isMounted.current) return;

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setProfileFetched(true);
      setProfileError(null);

      // Ya no volvemos a pedir profile mientras estemos logueados.
    } catch (error) {
      console.error("ERROR PROFILE:", error.response?.data || error.message);

      if (!isMounted.current) return;

      const status = error.response?.status;
      if (status === 401) {
        logout();
      } else if (status === 429) {
        setProfileError('rate-limit');

        if (profileRateLimitTimer.current) clearTimeout(profileRateLimitTimer.current);
        profileRateLimitTimer.current = setTimeout(() => {
          if (!isMounted.current) return;
          setProfileError(null);
        }, 60_000);
      } else {
        setProfileError('unknown');
      }
    } finally {
      if (isMounted.current) setProfileLoading(false);
    }
  }, [token, profileLoading, profileFetched, profileError]);

  // ==========================
  // 🔄 AUTO LOAD PROFILE
  // ==========================
  useEffect(() => {
    if (!isMounted.current) return;

    if (token && !user && !profileLoading && !profileFetched && profileError !== 'rate-limit') {
      getProfile();
    }
  }, [token, user, profileLoading, profileFetched, profileError, getProfile]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (profileRateLimitTimer.current) clearTimeout(profileRateLimitTimer.current);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profileLoading,
        profileError,
        login,
        logout,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}