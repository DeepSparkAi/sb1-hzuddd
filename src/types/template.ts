export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  config_schema: ConfigField[];
  default_products: ProductTemplate[];
  created_at: string;
  updated_at: string;
  erase_prior: boolean;
}

export interface ConfigField {
  name: string;
  key: string;
  type: 'text' | 'color' | 'image' | 'number' | 'select' | 'multiselect';
  description: string;
  required: boolean;
  default_value?: string | number;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ProductTemplate {
  name: string;
  description: string;
  amount: number;
  interval: 'month' | 'year';
  features: string[];
}