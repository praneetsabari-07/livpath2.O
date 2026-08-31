import axios from 'axios';
import { routes } from '../config/routes';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export default api;