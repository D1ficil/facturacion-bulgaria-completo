import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Сесията е изтекла. Моля, влезте отново.');
          break;
          
        case 403:
          toast.error('Нямате права за това действие.');
          break;
          
        case 404:
          toast.error('Ресурсът не е намерен.');
          break;
          
        case 422:
          const validationErrors = error.response.data?.errors;
          if (validationErrors && Array.isArray(validationErrors)) {
            validationErrors.forEach(err => toast.error(err.msg));
          } else {
            toast.error('Грешка във валидацията на данните.');
          }
          break;
          
        case 500:
          toast.error('Възникна грешка в сървъра.');
          break;
          
        default:
          toast.error(error.response.data?.error || 'Възникна неочаквана грешка.');
      }
    } else if (error.request) {
      toast.error('Няма връзка със сървъра.');
    } else {
      toast.error('Възникна неочаквана грешка.');
    }
    
    return Promise.reject(error);
  }
);

export default api;