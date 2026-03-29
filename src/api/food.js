import axios from "axios";
import API_URL from "../utils/config";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// 🔥 Corregido: rutas correctas según backend
// Crear entrada de comida sin imagen
export const createFoodEntry = (data) =>
  axios.post(`${API_URL}/api/food/entries`, data, { headers: authHeader() });

// Crear entrada de comida con imagen
export const createFoodEntryWithImage = (formData) =>
  axios.post(`${API_URL}/api/food/entries`, formData, { headers: authHeader() });

// Obtener entradas por fecha
export const getFoodEntries = (date) =>
  axios.get(`${API_URL}/api/food/entries?fecha=${date}`, { headers: authHeader() });

// Totales diarios
export const getDailyTotals = (date) =>
  axios.get(`${API_URL}/api/food/totals?fecha=${date}`, { headers: authHeader() });

// Totales semanales
export const getWeeklyTotals = () =>
  axios.get(`${API_URL}/api/food/weekly-totals`, { headers: authHeader() });

// Borrar entrada
export const deleteFoodEntry = (id) =>
  axios.delete(`${API_URL}/api/food/entries/${id}`, { headers: authHeader() });

// Analizar texto, imagen de archivo o URL de imagen de comida con IA/LogMeal
export const analyzeFood = ({ text, imageFile, imageUrl }) => {
  const config = { headers: authHeader() };

  if (imageFile) {
    const formData = new FormData();
    if (text) formData.append("text", text.trim());
    formData.append("image", imageFile);
    return axios.post(`${API_URL}/api/food/ai/calories`, formData, config); // 🔥 Corregido: ruta correcta
  }

  if (imageUrl) {
    const payload = { imageUrl: imageUrl.trim() };
    if (text) payload.text = text.trim();
    return axios.post(`${API_URL}/api/food/ai/calories`, payload, config);
  }

  return axios.post(`${API_URL}/api/food/ai/calories`, { text: (text || "").trim() }, config);
};