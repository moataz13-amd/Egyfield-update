import axios from 'axios';

/**
 * Recursively parses JSON strings inside an object.
 * Safe: never leaves an object value that would crash React rendering.
 */
export function deepParse(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(deepParse);
  const result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try {
        result[key] = deepParse(JSON.parse(val));
      } catch {
        result[key] = val;
      }
    } else if (typeof val === 'object' && val !== null) {
      result[key] = deepParse(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Safely resolves a potentially multilingual field to a string.
 * Call this before rendering any field that could be {en, ar, fr, it, tr}.
 */
export function resolveField(field, language = 'en') {
  if (field === null || field === undefined) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    const langVal = field[language];
    if (typeof langVal === 'string' && langVal) return langVal;
    const enVal = field.en;
    if (typeof enVal === 'string' && enVal) return enVal;
    const arVal = field.ar;
    if (typeof arVal === 'string' && arVal) return arVal;
    for (const val of Object.values(field)) {
      if (typeof val === 'string' && val) return val;
    }
    return '';
  }
  return String(field);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Only parse JSON — deepParse is called by hooks that need it
  transformResponse: [
    (data) => {
      try { return JSON.parse(data); } catch { return data; }
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

// SEO
export const getGlobalSeo = () => api.get('/seo/global');
export const updateGlobalSeo = (data) => api.put('/seo/global', data);
export const getSeoPages = (params) => api.get('/seo/pages', { params });
export const getSeoPage = (id) => api.get(`/seo/pages/${id}`);
export const createSeoPage = (data) => api.post('/seo/pages', data);
export const updateSeoPage = (id, data) => api.put(`/seo/pages/${id}`, data);
export const deleteSeoPage = (id) => api.delete(`/seo/pages/${id}`);
export const runSeoAudit = () => api.get('/seo/audit');
export const getSeoAnalysis = () => api.get('/seo/analysis');

export default api;
