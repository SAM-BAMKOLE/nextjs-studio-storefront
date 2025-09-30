import type { Timestamp } from "firebase/firestore";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  imageHint: string;
};

export type CartItem = {
  id: string; // Product ID
  quantity: number;
  name: string;
  price: number;
  imageUrl: string;
  imageHint: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Timestamp;
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'user';
};
