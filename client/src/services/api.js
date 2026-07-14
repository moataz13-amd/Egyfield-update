import axios from 'axios';

export function deepParse(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(deepParse);
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string' && (obj[key].startsWith('{') || obj[key].startsWith('['))) {
      try { obj[key] = JSON.parse(obj[key]); } catch {}
    } else {
      obj[key] = deepParse(obj[key]);
    }
  }
  return obj;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  transformResponse: [
    (data) => {
      try { return deepParse(JSON.parse(data)); } catch { return data; }
    },
  ],
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('egyfield-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('egyfield-token');
      localStorage.removeItem('egyfield-admin');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== API Functions =====

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getFeaturedProducts = () => api.get('/products/featured');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (formData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Categories
export const getCategories = (params) => api.get('/categories', { params });
export const getCategoryProducts = (slug, params) => api.get(`/categories/${slug}/products`, { params });
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Inquiries
export const createInquiry = (data) => api.post('/inquiries', data);
export const getInquiries = (params) => api.get('/inquiries', { params });
export const updateInquiryStatus = (id, status) => api.put(`/inquiries/${id}/status`, { status });
export const deleteInquiry = (id) => api.delete(`/inquiries/${id}`);

// Auth
export const loginAdmin = (data) => api.post('/auth/login', data);

export default api;
