import axios from "axios";
import { Order } from "../models/order.model";

export class ShopifyService {
  // ...other methods...

  async fetchProducts(): Promise<Order[]> {
    const url = `${process.env.SHOP_URL}/admin/api/2023-04/products.json`;
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOP_ACCESS_TOKEN,
    };

    try {
      console.log(process.env.GOOGLE_CLIENT_EMAIL);
      const response = await axios.get(url, { headers });
      return response.data.products;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async fetchOrders(): Promise<Order[]> {
    const url = `${process.env.SHOP_URL}/admin/api/2023-04/orders.json?status=any`;
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOP_ACCESS_TOKEN,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data.orders;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
