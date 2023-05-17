export interface Product {
  id: number;
  title: string;
  body_html: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  status: string;
  variants: Variant[];
}

export interface Variant {
  id: number;
  price: string;
}