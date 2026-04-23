import axios from 'axios';
import { getAuthToken } from '../utils/authUtils';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        console.error('Unauthorized - Please login again');
        // You could redirect to login page here
      } else if (status === 403) {
        console.error('Forbidden - You do not have permission');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error - Please try again later');
      }
      
      // Return error with message
      return Promise.reject({
        status,
        message: data?.detail || data?.message || 'An error occurred',
        data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - Please check your connection');
      return Promise.reject({
        status: 0,
        message: 'Network error - Please check your connection',
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default apiClient;
