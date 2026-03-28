import axios from 'axios';
import API_URL from './utils/config';

/**
 * Obtiene el offset de zona horaria del usuario en formato "+HH:MM" o "-HH:MM"
 * @returns {string} - Ej: "-05:00" para UTC-5
 */
const getTimezoneOffset = () => {
  const now = new Date();
  const offsetMs = -now.getTimezoneOffset() * 60000; // Convertir minutos a ms
  const offsetDate = new Date(offsetMs);
  
  const hours = String(Math.abs(Math.floor(offsetMs / 3600000))).padStart(2, '0');
  const minutes = String(Math.abs((offsetMs % 3600000) / 60000)).padStart(2, '0');
  const sign = offsetMs >= 0 ? '+' : '-';
  
  return `${sign}${hours}:${minutes}`;
};

/**
 * Headers de autorización + zona horaria
 * IMPORTANTE: La zona horaria se envía en cada request para que el backend
 * pueda convertir correctamente entre UTC y la zona horaria del usuario
 */
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'X-Timezone-Offset': getTimezoneOffset()  // Nuevo: enviar zona horaria
});

// Auth
export const getProfile = () => axios.get(`${API_URL}/api/auth/profile`, { headers: getAuthHeaders() });
export const updateAvatar = (formData) => axios.put(`${API_URL}/api/auth/profile/avatar`, formData, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
});

// Posts
export const getPosts = (page = 1, limit = 10) => axios.get(`${API_URL}/api/posts?page=${page}&limit=${limit}`, { headers: getAuthHeaders() });

// Stories
export const getStories = () => axios.get(`${API_URL}/api/stories`, { headers: getAuthHeaders() });
export const createStory = (formData) => axios.post(`${API_URL}/api/stories`, formData, {
  headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
});
export const deleteStory = (storyId) => axios.delete(`${API_URL}/api/stories/${storyId}`, { headers: getAuthHeaders() });

// AI/calorías
export const countCalories = (payload) => axios.post(`${API_URL}/api/ai/calories`, payload, { headers: getAuthHeaders() });
export const countCaloriesImage = (formData) => axios.post(`${API_URL}/api/ai/calories`, formData, {
  headers: getAuthHeaders() // axios pone boundary bien solo
});
// Food entries
export const createFoodEntry = (data) => axios.post(`${API_URL}/api/food/entries`, data, { headers: getAuthHeaders() });
export const createFoodEntryWithImage = (formData) => axios.post(`${API_URL}/api/food/entries`, formData, {
  headers: getAuthHeaders() // axios pone boundary bien solo
});
export const getFoodEntries = (fecha) => axios.get(`${API_URL}/api/food/entries${fecha ? `?fecha=${fecha}` : ''}`, { headers: getAuthHeaders() });
export const getDailyTotals = (fecha) => axios.get(`${API_URL}/api/food/totals${fecha ? `?fecha=${fecha}` : ''}`, { headers: getAuthHeaders() });
export const deleteFoodEntry = (id) => axios.delete(`${API_URL}/api/food/entries/${id}`, { headers: getAuthHeaders() });
export const getWeeklyTotals = () => axios.get(`${API_URL}/api/food/weekly-totals`, { headers: getAuthHeaders() });