import axios from 'axios';

// Set default headers untuk semua requests
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

// Interceptor untuk request
axios.interceptors.request.use(
  (config) => {
    // Pastikan header ngrok ada di setiap request
    if (!config.headers) {
      config.headers = {};
    }
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios; 