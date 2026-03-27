import axios from 'axios';
import API_URL from './utils/config';

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
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