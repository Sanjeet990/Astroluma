import axios from 'axios';
import { Buffer } from 'buffer';
import makeToast from './ToastUtils';

// Create a custom axios instance
const axiosInstance = axios.create();

// Add a request interceptor to introduce a delay
axiosInstance.interceptors.request.use(async (config) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(200); // Introduce a 500ms delay
  return config;
});

class ApiService {
  baseUrl = import.meta.env.VITE_API_BASE_URL || '';

  async get(endpoint, token = null, navigate = null) {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let url = null;
      if (endpoint.startsWith('http')) {
        url = endpoint;
      } else {
        url = `${this.baseUrl}${endpoint}?t=${Math.random()}`;
      }

      const response = await axiosInstance.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('GET Request Error:', error);
      handleApiError(error, navigate);
      throw {
        ...error,
        handled: isDatabaseError(error) ? true : false,
      }
    }
  }

  async post(endpoint, data, token = null, navigate = null) {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let url = null;
      if (endpoint.startsWith('http')) {
        url = endpoint;
      } else {
        url = `${this.baseUrl}${endpoint}?t=${Math.random()}`;
      }

      const response = await axiosInstance.post(url, data, { headers });
      return response.data;
    } catch (error) {
      console.error('POST Request Error:', error, navigate);
      handleApiError(error, navigate);
      throw {
        ...error,
        handled: isDatabaseError(error) ? true : false,
      }
    }
  }

  async postWithFormData(endpoint, formData, token = null, navigate = null) {
    try {
      const headers = {
        'Content-Type': 'multipart/form-data',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      let url = null;
      if (endpoint.startsWith('http')) {
        url = endpoint;
      } else {
        url = `${this.baseUrl}${endpoint}?t=${Math.random()}`;
      }

      const response = await axiosInstance.post(url, formData, { headers });
      return response.data;
    } catch (error) {
      console.error('POST FormData Request Error:', error);
      handleApiError(error, navigate);
      throw {
        ...error,
        handled: isDatabaseError(error) ? true : false,
      }
    }
  }

  async getImage(endpoint, token = null, navigate = null) {
    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Request the image as an array buffer
      const response = await axiosInstance.get(`${this.baseUrl}${endpoint}?t=${Math.random()}`, {
        headers,
        responseType: 'arraybuffer', // Ensure the response is treated as a binary array buffer
      });

      // Convert the binary data to a base64 string
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');
      const imageUrl = `data:${response.headers['content-type']};base64,${base64Image}`;

      return imageUrl;
    } catch (error) {
      console.error('GET Request Error:', error);
      handleApiError(error, navigate);
      throw {
        ...error,
        handled: isDatabaseError(error) ? true : false,
      }
    }
  }
}

const isDatabaseError = (error) => {
  const dbStatus = error.response?.headers['x-database-status'];
  return error.response?.status === 500 && dbStatus === 'NOT_CONNECTED';
};

// Helper function to handle API errors and navigate
const handleApiError = (error, navigate) => {
  if (error.code === 'ERR_NETWORK') {
    if (!navigator.onLine) {
      makeToast("error", 'No internet connection. Please check your network.');
    } else {
      if (!navigate) makeToast("error", 'Server is unavailable. Please try again later.');
      else navigate('/network-error');
    }
    throw {
      ...error,
      handled: false,
    };
  } else {

    const statusCode = error.response?.status;

    if (statusCode >= 400 && statusCode < 500 && navigate) {
      // Client error (4xx)
      if (statusCode === 401 || statusCode === 403) {
        navigate('/login');
      } else {
        navigate('/client-error');
      }
    } else if (statusCode >= 500 && statusCode < 600 && navigate) {
      if (isDatabaseError(error)) {
        navigate('/database-error');
      } else {
        // Server error (5xx)
        navigate('/server-error');
      }
    } else {
      if (navigate) navigate('/network-error');
    }
  }
};

const apiService = new ApiService();

export default apiService;