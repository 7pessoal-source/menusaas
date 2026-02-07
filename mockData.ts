
import { Restaurant, Category, Product } from './types';

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Burger Master Premium',
    slug: 'burger-master',
    logo: 'https://picsum.photos/seed/burger/200',
    // Fixed: Renamed camelCase properties to snake_case as per Restaurant interface
    primary_color: '#FBBF24',
    secondary_color: '#000000',
    contact_email: 'contato@burgermaster.com',
    contact_phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    address: 'Av. Paulista, 1000 - SP',
    isOpen: true,
    // Fix: Added missing required fields
    min_order_value: 0,
    allows_delivery: true
  },
  {
    id: 'rest-2',
    name: 'Sushi Zen',
    slug: 'sushi-zen',
    logo: 'https://picsum.photos/seed/sushi/200',
    // Fixed: Renamed camelCase properties to snake_case as per Restaurant interface
    primary_color: '#EF4444',
    secondary_color: '#1F2937',
    contact_email: 'contato@sushizen.com',
    contact_phone: '(11) 88888-8888',
    whatsapp: '5511888888888',
    address: 'Rua Liberdade, 500 - SP',
    isOpen: true,
    // Fix: Added missing required fields
    min_order_value: 0,
    allows_delivery: true
  }
];

export const mockCategories: Category[] = [
  // Fixed: Renamed restaurantId to restaurant_id as per Category interface
  { id: 'cat-1', restaurant_id: 'rest-1', name: 'Burgers Artesanais', order: 1 },
  { id: 'cat-2', restaurant_id: 'rest-1', name: 'Acompanhamentos', order: 2 },
  { id: 'cat-3', restaurant_id: 'rest-1', name: 'Bebidas', order: 3 },
  { id: 'cat-4', restaurant_id: 'rest-2', name: 'Sushis', order: 1 },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    // Fixed: Renamed properties to match snake_case defined in Product interface
    restaurant_id: 'rest-1',
    category_id: 'cat-1',
    name: 'Master Bacon Supreme',
    description: 'Pão brioche, blend 180g, queijo cheddar, bacon crocante e maionese da casa.',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600',
    is_available: true,
    is_promotion: true
  },
  {
    id: 'prod-2',
    // Fixed: Renamed properties to match snake_case defined in Product interface
    restaurant_id: 'rest-1',
    category_id: 'cat-1',
    name: 'Cheese Burger Classic',
    description: 'O clássico pão com carne e queijo mussarela derretido.',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=600',
    is_available: true
  },
  {
    id: 'prod-3',
    // Fixed: Renamed properties to match snake_case defined in Product interface
    restaurant_id: 'rest-1',
    category_id: 'cat-2',
    name: 'Batata Rústica Média',
    description: 'Batatas cortadas à mão com alecrim e sal grosso.',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1573015084184-3ce2af99b748?q=80&w=600',
    is_available: true,
    is_promotion: true
  },
  {
    id: 'prod-4',
    // Fixed: Renamed properties to match snake_case defined in Product interface
    restaurant_id: 'rest-1',
    category_id: 'cat-3',
    name: 'Suco de Laranja 500ml',
    description: 'Suco 100% natural espremido na hora.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=600',
    is_available: true
  }
];
