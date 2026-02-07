
export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  whatsapp: string;
  address: string;
  isOpen: boolean;
  min_order_value: number; // Novo campo
  allows_delivery: boolean; // Novo campo
  created_at?: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  is_available: boolean;
  is_promotion?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
