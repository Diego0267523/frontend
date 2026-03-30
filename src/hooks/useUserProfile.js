import { useState, useEffect } from "react";
import { getUserByUsername } from "../utils/mockUsers";
import { getPublicProfile, normalizeUsername } from "../utils/publicProfilesDB";

export const useUserProfile = (username) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cleanUsername = username?.toLowerCase()?.trim();

    setLoading(true);
    setError(null);
    setUser(null);

    if (!cleanUsername) {
      setError("Username no especificado");
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      try {
        let cachedUser = null;
        try {
          cachedUser = JSON.parse(localStorage.getItem("user") || "null");
        } catch {
          cachedUser = null;
        }

        const cachedUserSlug = normalizeUsername(
          cachedUser?.username || cachedUser?.nombre || cachedUser?.email?.split("@")[0] || ""
        );

        const userData =
          getUserByUsername(cleanUsername) ||
          getPublicProfile(cleanUsername) ||
          (cachedUser && cachedUserSlug === cleanUsername
            ? {
                ...cachedUser,
                posts: Array.isArray(cachedUser.posts) ? cachedUser.posts : [],
              }
            : null);

        if (!userData) {
          setError(`Usuario "${cleanUsername}" no encontrado`);
          setUser(null);
        } else {
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        console.error("❌ Error profile hook:", err);
        setError("Error al cargar el perfil del usuario");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [username]);

  return { user, loading, error };
};