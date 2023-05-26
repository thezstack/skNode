import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import { SheetsService } from "../services/sheets.service";

import express from "express";

const router = express.Router();
const sheetsService = new SheetsService();

router.get("/read-sheet", async (req, res) => {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID; // Replace with your Spreadsheet ID
    const range = "Dump!A1:F5"; // Update this to your specific range

    const data = await sheetsService.readRange(spreadsheetId, range);
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while reading from Google Sheets" });
  }
});

router.get("/build-products", async (req, res) => {
  try {
    const spreadsheetId = "12cMgbvqVqMbifb5SqsTqvABobGQ5M9wHfhN-fEgmo7o"; // Replace with your Spreadsheet ID
    const range = "HQA Master!A:P"; // Update this to your specific range

    const data = await sheetsService.processMultipleRange(spreadsheetId);
    res.status(200);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while reading from Google Sheets" });
  }
});

export class SheetsController {
  static async addOrderToSheet(order: Order) {
    return sheetsService.addOrder(order);
  }

  static async addProducts(product: Product[]) {
    return sheetsService.addProduct(product);
  }
}

export { router as sheetsRouter };
