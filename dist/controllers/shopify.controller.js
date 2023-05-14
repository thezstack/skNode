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
exports.shopifyRouter = void 0;
const express_1 = __importDefault(require("express"));
const shopify_service_1 = require("../services/shopify.service");
const sheets_controller_1 = require("./sheets.controller");
const router = express_1.default.Router();
exports.shopifyRouter = router;
const shopifyService = new shopify_service_1.ShopifyService();
router.get("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield shopifyService.fetchProducts();
        res.json(products);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching products" });
    }
}));
router.post("/webhooks/orders/create", express_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = req.body;
    // Do something with the order...
    console.log(order);
    try {
        yield sheets_controller_1.SheetsController.addOrderToSheet(order);
        // Respond to Shopify to acknowledge receipt of the webhook
        res.status(200).end();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred while adding order to Google Sheets",
        });
    }
}));
//# sourceMappingURL=shopify.controller.js.map