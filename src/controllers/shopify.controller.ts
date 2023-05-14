import express from "express";
import { ShopifyService } from "../services/shopify.service";
import { Order } from "../models/order.model";

const router = express.Router();
const shopifyService = new ShopifyService();

router.get("/products", async (req, res) => {
  try {
    const products: Order[] = await shopifyService.fetchProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
});

router.post("/webhooks/orders/create", express.json(), (req, res) => {
  const order: Order = req.body;

  // Do something with the order...
  console.log(order);

  // Respond to Shopify to acknowledge receipt of the webhook
  res.status(200).end();
});

export { router as shopifyRouter };
