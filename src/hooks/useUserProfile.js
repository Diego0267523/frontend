/**
 * 🎣 HOOK: useUserProfile
 * Obtiene datos de perfil de usuario por nombre de usuario
 * Maneja estados de carga, errores y caché
 */

import { useState, useEffect } from "react";
import { getUserByUsername } from "../utils/mockUsers";

/**
 * Hook para cargar perfil de usuario
 * @param {string} username - Nombre del usuario (from URL params)
 * @returns {object} - { user, loading, error }
 */
export const useUserProfile = (username) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      setError("Username no especificado");
      setLoading(false);
      return;
    }

    // Simular delay de red (en producción sería una llamada HTTP)
    const timer = setTimeout(() => {
      try {
        const userData = getUserByUsername(username);

        if (!userData) {
          setError(`Usuario "${username}" no encontrado`);
          setUser(null);
        } else {
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        setError("Error al cargar el perfil del usuario");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, 300); // Simular latencia de red

    return () => clearTimeout(timer);
  }, [username]);

  return { user, loading, error };
};
