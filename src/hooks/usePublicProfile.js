/**
 * 🎣 HOOK: usePublicProfile
 * 
 * Carga perfil público de usuario sin requerir autenticación
 * Maneja estados: cargando, error, datos
 */

import { useState, useEffect } from "react";
import { getPublicProfile } from "../utils/publicProfilesDB";

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

    // Simular latencia de red (300ms)
    const timer = setTimeout(() => {
      try {
        const profileData = getPublicProfile(username);

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
  }, [username]);

  return { profile, loading, error, notFound };
}
