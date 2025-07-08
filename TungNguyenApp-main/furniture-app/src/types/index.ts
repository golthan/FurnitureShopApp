// User types
export type User = {
  id: number;
  username: string;
  role: string;
};

export type AuthResponse = {
  token: string;
  id: number;
  username: string;
  role: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  role?: string;
};

export type UserUpdateRequest = {
  username?: string;
  password?: string;
  role?: string;
};

// Product types
export type ProductImage = {
  id: number;
  imageUrl: string;
  isPrimary: number;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  promotionId?: number;
  promotionTitle?: string;
  images: ProductImage[];
};

export type ProductPage = {
  content: Product[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type ProductRequest = {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  promotionId?: number;
};

// Category types
export type Category = {
  id: number;
  name: string;
  description: string;
};

export type CategoryRequest = {
  name: string;
  description: string;
};

// Order types
export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: number;
  userId: number;
  username: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  orderItems: OrderItem[];
};

export type PaginatedOrderResponse = {
  orders: Order[];
  totalPages: number;
};

export type CreateOrderRequest = {
  userId: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

// Promotion types
export type Promotion = {
  id: number;
  title: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
};

export type PromotionRequest = {
  title: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
};

// Customer types
export type Customer = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

export type CustomerRequest = {
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

// Admin Dashboard types
export type DashboardOverview = {
  userCount: number;
  productCount: number;
  orderCount: number;
};

export type SalesStatistics = {
  totalRevenue: string;
  monthlyRevenue: string;
  dailyRevenue: string;
};

export type ProductStatistics = {
  topSellingProduct: string;
  lowStockItems: string;
};
