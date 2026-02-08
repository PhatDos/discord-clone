import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
});

// Request interceptor để tự động thêm token
apiClient.interceptors.request.use(
  async (config) => {
    // Token sẽ được set từ component thông qua getToken
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
