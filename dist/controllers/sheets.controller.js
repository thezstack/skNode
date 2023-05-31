"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheetsRouter = exports.SheetsController = void 0;
const sheets_service_1 = require("../services/sheets.service");
const shopify_service_1 = require("../services/shopify.service");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.sheetsRouter = router;
const sheetsService = new sheets_service_1.SheetsService();
const shopifyService = new shopify_service_1.ShopifyService();
router.get("/read-sheet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID; // Replace with your Spreadsheet ID
        const range = "Dump!A1:F5"; // Update this to your specific range
        const data = yield sheetsService.readRange(spreadsheetId, range);
        res.json(data);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "An error occurred while reading from Google Sheets" });
    }
}));
router.get("/build-products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const spreadsheetId = "12cMgbvqVqMbifb5SqsTqvABobGQ5M9wHfhN-fEgmo7o"; // Replace with your Spreadsheet ID
        const range = "HQA Master!A:P"; // Update this to your specific range
        const data = yield sheetsService.processMultipleRange(spreadsheetId);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "An error occurred while reading from Google Sheets" });
    }
}));
router.get("/completed-products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield sheetsService.getCompletedProductsForShopify();
        console.log(data);
        //   await shopifyService.updateProducts(data);
        res.status(200).json({ message: "success" });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ message: "An error occurred while reading from Google Sheets" });
    }
}));
router.post("/build-completed-sheets", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log(req);
    yield sheetsService.createSheets(req.body.spreadsheet_id, req.body.id);
    res.status(200).json({ message: "Success" });
}));
router.get("/build-procurement", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log(req);
    yield sheetsService.buildProcurement();
    res.status(200).json({ message: "Success" });
}));
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
class SheetsController {
    static addOrderToSheet(order) {
        return __awaiter(this, void 0, void 0, function* () {
            return sheetsService.addOrder(order);
        });
    }
    static addProducts(product) {
        return __awaiter(this, void 0, void 0, function* () {
            return sheetsService.addProduct(product);
        });
    }
}
exports.SheetsController = SheetsController;
//# sourceMappingURL=sheets.controller.js.map