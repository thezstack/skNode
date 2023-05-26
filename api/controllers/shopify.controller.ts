import express from "express";
import { ShopifyService } from "../services/shopify.service";
import { Order, LineItem, Customer } from "../models/order.model";
import { Product } from "../models/product.model";
import { SheetsController } from "./sheets.controller";

const router = express.Router();
const shopifyService = new ShopifyService();

router.get("/products", async (req, res) => {
  try {
    const products: Product[] = await shopifyService.fetchProducts();
    try {
      await SheetsController.addProducts(products);
      // Respond to Shopify to acknowledge receipt of the webhook
      res.status(200).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error occurred while adding order to Google Sheets",
      });
    }
    //  res.json(products);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orders: Order[] = await shopifyService.fetchOrders();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching products" });
  }
});

router.post("/webhooks/orders/create", express.json(), async (req, res) => {
  const order: Order = {
    id: req.body.id,
    email: req.body.email,
    created_at: req.body.created_at,
    line_items: req.body.line_items.map(
      (item: any) =>
        ({
          id: item.product_id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        } as LineItem)
    ),
    total_price: req.body.total_price,
    customer: {
      id: req.body.customer.id,
      email: req.body.customer.email,
      first_name: req.body.customer.first_name,
      last_name: req.body.customer.last_name,
    },
    order_number: req.body.order_number,
    notes: req.body.note,
  };
  //const order: Order = req.body;
  // Do something with the order...
  console.log(order);

  try {
    await SheetsController.addOrderToSheet(order);
    // Respond to Shopify to acknowledge receipt of the webhook
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while adding order to Google Sheets",
    });
  }
});

export { router as shopifyRouter };
