import axios from 'axios';
import { ShortenUrlRequest, ShortenUrlResponse, UrlStats } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-api-gateway-url';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const urlApi = {
  /**
   * Shorten a URL
   */
  async shortenUrl(data: ShortenUrlRequest): Promise<ShortenUrlResponse> {
    const response = await api.post('/shorten', data);
    return response.data;
  },

  /**
   * Get URL statistics
   */
  async getStats(shortCode: string): Promise<UrlStats> {
    const response = await api.get(`/stats/${shortCode}`);
    return response.data;
  },

  /**
   * Validate if a URL is reachable (optional endpoint)
   */
  async validateUrl(url: string): Promise<{ isValid: boolean }> {
    try {
      const response = await api.post('/validate', { url });
      return response.data;
    } catch (error) {
      return { isValid: false };
    }
  },
};

export default api;