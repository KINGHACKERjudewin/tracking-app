import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://tracking-app-s7vn.onrender.com/api';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Tasks ───────────────────────────────────────────────
export const taskService = {
  getAll:  () => api.get('/tasks'),
  create:  (data: any) => api.post('/tasks', data),
  update:  (id: string, data: any) => api.put(`/tasks/${id}`, data),
  remove:  (id: string) => api.delete(`/tasks/${id}`),
};

// ─── Budget ──────────────────────────────────────────────
export const budgetService = {
  getAll:  () => api.get('/budget'),
  create:  (data: any) => api.post('/budget', data),
  update:  (id: string, data: any) => api.put(`/budget/${id}`, data),
  remove:  (id: string) => api.delete(`/budget/${id}`),
  summary: () => api.get('/budget/summary'),
};

// ─── Time Tracking ───────────────────────────────────────
export const timeService = {
  getSessions: () => api.get('/time'),
  start:       (data: any) => api.post('/time/start', data),
  stop:        (id: string, data: any) => api.put(`/time/${id}/stop`, data),
  remove:      (id: string) => api.delete(`/time/${id}`),
};
