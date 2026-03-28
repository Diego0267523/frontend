import axios from "axios";
import API_URL from "./config";

// Configurar axios base
axios.defaults.baseURL = API_URL;

// Interceptor de request: agregar token automáticamente
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: manejar errores globales
axios.interceptors.response.use(
  (response) => response, // Si es exitoso, devolver normal
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // Token inválido: logout automático
      console.warn("🔐 Token inválido, cerrando sesión...");
      localStorage.removeItem("token");
      // Redirigir a login si es necesario (opcional, depende del componente)
      window.location.href = "/login";
    } else if (status === 429) {
      // Rate limit: mostrar warning sin romper app
      console.warn("⚠️ Rate limit alcanzado:", message);
      // Podrías mostrar un toast global aquí
    } else if (status >= 500) {
      // Error del servidor: log y fallback
      console.error("🔥 Error del servidor:", message);
    } else {
      // Otros errores: log
      console.error("❌ Error de API:", message);
    }

    return Promise.reject(error);
  }
);

export default axios;