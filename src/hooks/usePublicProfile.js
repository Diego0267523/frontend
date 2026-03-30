/**
 * 🎣 HOOK: usePublicProfile
 * 
 * Carga perfil público de usuario sin requerir autenticación
 * Maneja estados: cargando, error, datos
 */

import { useState, useEffect } from "react";
import { getPublicProfile, normalizeUsername } from "../utils/publicProfilesDB";
import { getUserByUsername } from "../utils/mockUsers";

/**
 * Hook para cargar perfil público
 * 
 * @param {string} username - Nombre de usuario (from URL params)
 * @returns {object} { profile, loading, error, notFound }
 */
export function usePublicProfile(username) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) {
      setError("Username no especificado");
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const cleanUsername = normalizeUsername(username);
        const mockUser = getUserByUsername(cleanUsername);

        let cachedUser = null;
        try {
          cachedUser = JSON.parse(localStorage.getItem("user") || "null");
        } catch {
          cachedUser = null;
        }

        const cachedUserSlug = normalizeUsername(
          cachedUser?.username || cachedUser?.nombre || cachedUser?.email?.split("@")[0] || ""
        );

        const profileData =
          getPublicProfile(cleanUsername) ||
          (mockUser
            ? {
                ...mockUser,
                followers: mockUser.followers || 0,
                following: mockUser.following || 0,
                portada:
                  mockUser.portada ||
                  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop",
              }
            : null) ||
          (cachedUser && cachedUserSlug === cleanUsername
            ? {
                ...cachedUser,
                username: cleanUsername,
                followers: cachedUser.followers || 0,
                following: cachedUser.following || 0,
                portada:
                  cachedUser.portada ||
                  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop",
                posts: Array.isArray(cachedUser.posts) ? cachedUser.posts : [],
              }
            : null) ||
          {
            username: cleanUsername,
            nombre: cleanUsername?.replace(/-/g, " ") || "Usuario",
            bio: "Perfil público en preparación",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername || "Usuario")}&background=111827&color=00ff88`,
            portada:
              "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop",
            followers: 0,
            following: 0,
            posts: [],
          };

        setProfile(profileData);
        setNotFound(false);
        setError(null);
      } catch (err) {
        setError("Error al cargar el perfil");
        setProfile(null);
        setNotFound(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  return { profile, loading, error, notFound };
}
