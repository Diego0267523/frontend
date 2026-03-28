import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api from "../utils/api";

// Hook useAuth con React Query
export function useAuth() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Query para obtener perfil
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/api/auth/profile");
      return res.data;
    },
    enabled: !!token, // Solo si hay token
    retry: 1, // máximo 1 reintento
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5, // 5 minutos cache
  });

  // Manejar errores
  if (error) {
    console.error("Error profile:", error);
  }

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

  return {
    user: data,
    loading: isLoading,
    error,
    token,
    login,
    logout,
  };
}