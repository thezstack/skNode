import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import { SheetsService } from "../services/sheets.service";
import { ShopifyService } from "../services/shopify.service";
import express from "express";

const router = express.Router();
const sheetsService = new SheetsService();
const shopifyService = new ShopifyService();

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

    res.status(200).json({ message: "success" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while reading from Google Sheets" });
  }
});

router.get("/completed-products", async (req, res) => {
  try {
    const data = await sheetsService.getCompletedProductsForShopify();
    console.log(data);
    await shopifyService.updateProducts(data);

    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occurred while reading from Google Sheets" });
  }
});

router.post("/build-completed-sheets", async (req, res) => {
  //console.log(req);
  await sheetsService.createSheets(req.body.spreadsheet_id, req.body.id);
  res.status(200).json({ message: "Success" });
});

router.get("/build-procurement", async (req, res) => {
  //console.log(req);
  await sheetsService.buildProcurement();
  res.status(200).json({ message: "Success" });
});

// router.post("/track-supply-changes", async (req, res) => {
//   try {
//     const data = await sheetsService.trackSupplyChanges(req.body);
//     res.status(200).json({ message: "Success" });
//   } catch (error) {
//     console.log(error);
//     res
//       .status(500)
//       .json({ message: "An error occurred while reading from Google Sheets" });
//   }
// });

export class SheetsController {
  static async addOrderToSheet(order: Order) {
    return sheetsService.addOrder(order);
  }

  static async addProducts(product: Product[]) {
    return sheetsService.addProduct(product);
  }
}

export { router as sheetsRouter };
