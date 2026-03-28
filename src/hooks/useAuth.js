import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../utils/config";

// Configurar axios global para incluir token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hook useAuth con React Query
export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Query para obtener perfil
  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/auth/profile`);
      return response.data;
    },
    enabled: !!token, // Solo si hay token
    staleTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false; // No retry en 401
      if (error?.response?.status === 429) return false; // No retry en 429
      return failureCount < 2;
    },
    onError: (error) => {
      console.error("Error fetching profile:", error.response?.data || error.message);
      const status = error?.response?.status;
      if (status === 401) {
        logout(); // Limpiar sesión
      } else if (status === 429) {
        console.warn("Rate limit alcanzado, esperando...");
      }
    },
  });

  // Login
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    queryClient.invalidateQueries({ queryKey: ["profile"] }); // Refrescar perfil
  };

  // Logout
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    queryClient.clear(); // Limpiar todo el cache
  };

  // Sincronizar token con localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return {
    user,
    loading,
    error,
    token,
    login,
    logout,
    refetch,
  };
}