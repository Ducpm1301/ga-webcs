import axios from 'axios';
import { API_KEY } from '../configs/apiConfig';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
});

// Add request interceptor to automatically add API key header
axiosInstance.interceptors.request.use(
  (config) => {
    // Add API key header to all requests
    config.headers['apikey'] = API_KEY;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors globally
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - please check API key');
    } else if (error.response?.status === 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;