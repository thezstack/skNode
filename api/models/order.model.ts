export interface LineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
}

export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Order {
  id: number;
  email: string;
  created_at: string;
  line_items: LineItem[];
  total_price: string;
  customer: Customer;
  order_number: number;
  notes: string;
}
