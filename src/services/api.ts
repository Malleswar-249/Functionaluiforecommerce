import { projectId, publicAnonKey } from '../utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-fe618f6f`;

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string | null;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', body, token } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Products
export const getProducts = () => request('/products');
export const getProduct = (id: string) => request(`/products/${id}`);
export const createProduct = (productData: any, token: string) => 
  request('/products', { method: 'POST', body: productData, token });
export const updateProduct = (id: string, productData: any, token: string) =>
  request(`/products/${id}`, { method: 'PUT', body: productData, token });
export const deleteProduct = (id: string, token: string) =>
  request(`/products/${id}`, { method: 'DELETE', token });

// Categories
export const getCategories = () => request('/categories');
export const createCategory = (categoryData: any, token: string) =>
  request('/categories', { method: 'POST', body: categoryData, token });

// Cart
export const getCart = (token: string) => request('/cart', { token });
export const addToCart = (productId: string, quantity: number, token: string) =>
  request('/cart', { method: 'POST', body: { productId, quantity }, token });
export const removeFromCart = (productId: string, token: string) =>
  request(`/cart/${productId}`, { method: 'DELETE', token });
export const updateCartItem = (productId: string, quantity: number, token: string) =>
  request(`/cart/${productId}`, { method: 'PUT', body: { quantity }, token });

// Orders
export const getOrders = (token: string) => request('/orders', { token });
export const getOrder = (id: string, token: string) => request(`/orders/${id}`, { token });
export const createOrder = (orderData: any, token: string) =>
  request('/orders', { method: 'POST', body: orderData, token });
export const updateOrder = (id: string, updates: any, token: string) =>
  request(`/orders/${id}`, { method: 'PUT', body: updates, token });

// Payments
export const processPayment = (paymentData: any, token: string) =>
  request('/payments', { method: 'POST', body: paymentData, token });
export const verifyPayment = (paymentId: string, token: string) =>
  request('/payments/verify', { method: 'POST', body: { paymentId }, token });

// Profile
export const getProfile = (token: string) => request('/profile', { token });
export const updateProfile = (profileData: any, token: string) =>
  request('/profile', { method: 'PUT', body: profileData, token });

// Admin
export const getAdminStats = (token: string) => request('/admin/stats', { token });
export const seedDatabase = (token: string) => request('/seed', { method: 'POST', token });
