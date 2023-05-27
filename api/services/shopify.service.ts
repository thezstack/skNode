import axios from "axios";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
export class ShopifyService {
  // ...other methods...

  async fetchProducts(): Promise<Product[]> {
    const fields = [
      "id",
      "title",
      "product_type",
      "body_html",
      "created_at",
      "updated_at",
      "status",
      "variants",
    ].join(",");
    const url = `${process.env.SHOP_URL}/admin/api/2023-04/products.json?fields=${fields}&status=draft`;
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOP_ACCESS_TOKEN,
    };

    try {
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

  async updateProducts(products: any): Promise<any> {
    const headers = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOP_ACCESS_TOKEN,
    };
    console.log(products);
    for (const product of products) {
      try {
        // Define the URL for the API endpoint to update the product
        const url = `${process.env.SHOP_URL}/admin/api/2023-04/products/${product.id}.json`;

        // Prepare the data for the request body
        const data = {
          product: {
            id: product.id,
            body_html: product.body_html,
            // Include any other product properties you want to update...
          },
        };

        // Make the PUT request to update the product
        const response = await axios.put(url, data, { headers });

        console.log("Updated product:", response.data.product);
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  }
}
