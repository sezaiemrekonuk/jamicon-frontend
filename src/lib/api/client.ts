import axios from 'axios';
import { getCookie } from 'cookies-next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // You can add refresh token logic here
        // const refreshToken = getCookie('refreshToken');
        // const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        // setCookie('accessToken', response.data.accessToken);
        // originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        // return apiClient(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (redirect to login, etc.)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
); 