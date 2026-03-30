/**
 * 🎣 HOOK: usePublicProfile
 * 
 * Carga perfil público de usuario sin requerir autenticación
 * Maneja estados: cargando, error, datos
 */

import { useState, useEffect } from "react";
import { getPublicProfile, normalizeUsername, publicProfilesDB } from "../utils/publicProfilesDB";
import { getUserByUsername } from "../utils/mockUsers";

/**
 * Hook para cargar perfil público
 * 
 * @param {string} username - Nombre de usuario (from URL params)
 * @returns {object} { profile, loading, error, notFound }
 */
export function usePublicProfile(username, seedProfile = null) {
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

        let sessionProfile = null;
        try {
          sessionProfile = JSON.parse(sessionStorage.getItem(`public-profile:${cleanUsername}`) || "null");
        } catch {
          sessionProfile = null;
        }

        const cachedUserSlug = normalizeUsername(
          cachedUser?.username || cachedUser?.nombre || cachedUser?.email?.split("@")[0] || ""
        );

        const normalizedSeedUsername = normalizeUsername(
          seedProfile?.username || seedProfile?.nombre || seedProfile?.email?.split?.("@")[0] || ""
        );

        const hydratedSeedProfile =
          seedProfile && normalizedSeedUsername === cleanUsername
            ? {
                ...seedProfile,
                username: cleanUsername,
                followers: seedProfile.followers || 0,
                following: seedProfile.following || 0,
                portada:
                  seedProfile.portada ||
                  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop",
                posts: Array.isArray(seedProfile.posts) ? seedProfile.posts : [],
              }
            : null;

        if (hydratedSeedProfile) {
          publicProfilesDB[cleanUsername] = {
            ...(publicProfilesDB[cleanUsername] || {}),
            ...hydratedSeedProfile,
          };

          try {
            sessionStorage.setItem(
              `public-profile:${cleanUsername}`,
              JSON.stringify(publicProfilesDB[cleanUsername])
            );
          } catch {
            // ignore storage write issues
          }
        }

        const profileData =
          hydratedSeedProfile ||
          getPublicProfile(cleanUsername) ||
          sessionProfile ||
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
          (process.env.NODE_ENV !== "production" && mockUser
            ? {
                ...mockUser,
                followers: mockUser.followers || 0,
                following: mockUser.following || 0,
                portada:
                  mockUser.portada ||
                  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=300&fit=crop",
              }
            : null);

        if (!profileData) {
          setNotFound(true);
          setProfile(null);
          setError(null);
        } else {
          setProfile(profileData);
          setNotFound(false);
          setError(null);
        }
      } catch (err) {
        setError("Error al cargar el perfil");
        setProfile(null);
        setNotFound(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [seedProfile, username]);

  return { profile, loading, error, notFound };
}
