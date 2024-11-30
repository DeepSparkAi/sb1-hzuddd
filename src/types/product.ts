export interface Product {
  id: string;
  app_id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripe_price_id: string;
  stripe_product_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}