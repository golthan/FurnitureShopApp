import axios, { AxiosError } from 'axios';
import { AuthResponse, Customer, CustomerRequest, Category, CategoryRequest, Product, ProductRequest, Promotion, PromotionRequest, DashboardOverview, SalesStatistics, ProductStatistics, PaginatedOrderResponse, Order, User, UserUpdateRequest } from '../types';
import { getToken } from '../utils/storage';
import { callLogoutHandler } from '../contexts/AuthContext';
import { Alert } from 'react-native';

const API_BASE_URL = 'http://192.168.22.14:8080'; // Should be configurable

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      Alert.alert('Phiên đăng nhập đã hết hạn', 'Vui lòng đăng nhập lại.');
      callLogoutHandler();
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (credentials: { username: string; password: string; role?: string }): Promise<User> => {
  const response = await api.post('/auth/register', credentials);
  // Assuming the API returns the new user object upon successful registration.
  // If it only returns a message, this needs to be handled differently,
  // likely by re-fetching the user list. But this is more optimistic.
  return response.data;
};

export const changePassword = async (passwords: { currentPassword: string; newPassword: string }): Promise<string> => {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Không có token xác thực');
    }
    
    const response = await axios.post(`${API_BASE_URL}/auth/change-password`, passwords, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.log('Change password error details:', error.response || error.message);
    
    if (error.response?.status === 401) {
      // Xử lý riêng cho lỗi 401 khi đổi mật khẩu
      throw new Error('Lỗi xác thực. Phiên đăng nhập có thể đã hết hạn.');
    } else if (error.response?.status === 400) {
      throw new Error('Mật khẩu hiện tại không đúng!');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Đã xảy ra lỗi khi thay đổi mật khẩu');
    }
  }
};

// Category APIs
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get('/api/categories');
  return response.data;
};

export const getCategoryById = async (id: number): Promise<Category> => {
  const response = await api.get(`/api/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: CategoryRequest): Promise<Category> => {
  const response = await api.post('/api/categories', data);
  return response.data;
};

export const updateCategory = async (id: number, data: CategoryRequest): Promise<Category> => {
  const response = await api.put(`/api/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/api/categories/${id}`);
};

// Customer APIs
export const getCustomerByUserId = async (userId: number): Promise<Customer> => {
  const response = await api.get(`/api/customers/user/${userId}`);
  return response.data;
};

export const createCustomer = async (data: CustomerRequest): Promise<Customer> => {
  const response = await api.post('/api/customers', data);
  return response.data;
};

export const updateCustomerByUserId = async (userId: number, data: CustomerRequest): Promise<Customer> => {
  const response = await api.put(`/api/customers/user/${userId}`, data);
  return response.data;
};

export const deleteCustomerByUserId = async (userId: number): Promise<void> => {
  await api.delete(`/api/customers/user/${userId}`);
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  const response = await api.get('/api/customers');
  return response.data;
};

export const getCustomerById = async (id: number): Promise<Customer> => {
  const response = await api.get(`/api/customers/${id}`);
  return response.data;
};

// Product APIs
export const getProducts = async (page = 0, size = 10, categoryId?: number, keyword?: string) => {
  let url = `/api/products?page=${page}&size=${size}`;
  if (categoryId) url += `&categoryId=${categoryId}`;
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getProductById = async (id: number): Promise<Product> => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (data: ProductRequest): Promise<Product> => {
  const response = await api.post('/api/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: ProductRequest): Promise<Product> => {
  const response = await api.put(`/api/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/api/products/${id}`);
};

export const getProductImages = async (productId: number) => {
  const response = await api.get(`/api/products/${productId}/images`);
  return response.data;
};

export const uploadProductImage = async (productId: number, imageFile: any, isPrimary: number = 0) => {
  try {
    const formData = new FormData();
    
    // Thêm file vào formData
    formData.append('file', imageFile);
    formData.append('isPrimary', isPrimary.toString());
    
    const response = await api.post(`/api/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      transformRequest: (data, headers) => {
        return data;
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProductImage = async (imageId: number): Promise<void> => {
  await api.delete(`/api/products/images/${imageId}`);
};

// Order APIs
export const getAdminOrders = async (page = 0, size = 10): Promise<PaginatedOrderResponse> => {
  const response = await api.get(`/api/orders/admin/orders?page=${page}&size=${size}`);
  return response.data;
};

export const getOrderById = async (id: number): Promise<Order> => {
  const response = await api.get(`/api/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string): Promise<Order> => {
  const response = await api.put(`/api/orders/${id}/${status}`);
  return response.data;
};

// Promotion APIs
export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await api.get('/api/promotions');
  return response.data;
};

export const getPromotionById = async (id: number): Promise<Promotion> => {
  const response = await api.get(`/api/promotions/${id}`);
  return response.data;
};

export const createPromotion = async (data: PromotionRequest): Promise<Promotion> => {
  const response = await api.post('/api/promotions', data);
  return response.data;
};

export const updatePromotion = async (id: number, data: PromotionRequest): Promise<Promotion> => {
  const response = await api.put(`/api/promotions/${id}`, data);
  return response.data;
};

export const deletePromotion = async (id: number): Promise<void> => {
  await api.delete(`/api/promotions/${id}`);
};

// User APIs
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/api/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/api/users/${id}`);
  return response.data;
};

export const updateUser = async (id: number, data: UserUpdateRequest): Promise<User> => {
  const response = await api.put(`/api/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/api/users/${id}`);
};

// Admin Dashboard APIs
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await api.get('/api/admin/stats/overview');
  return response.data;
};

export const getSalesStatistics = async (): Promise<SalesStatistics> => {
  const response = await api.get('/api/admin/stats/sales');
  return response.data;
};

export const getProductStatistics = async (): Promise<ProductStatistics> => {
  const response = await api.get('/api/admin/stats/products');
  return response.data;
};

export default api;
export { API_BASE_URL };
