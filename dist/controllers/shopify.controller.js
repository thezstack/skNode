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
const sheets_service_1 = require("../services/sheets.service");
const router = express_1.default.Router();
exports.shopifyRouter = router;
const shopifyService = new shopify_service_1.ShopifyService();
const sheetsService = new sheets_service_1.SheetsService();
router.get("/products", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield shopifyService.fetchProducts();
        try {
            yield sheets_controller_1.SheetsController.addProducts(products);
            // Respond to Shopify to acknowledge receipt of the webhook
            res.status(200).end();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                message: "An error occurred while adding order to Google Sheets",
            });
        }
        //  res.json(products);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching products" });
    }
}));
router.get("/orders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield shopifyService.fetchOrders();
        res.json(orders);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ message: "An error occurred while fetching products" });
    }
}));
router.post("/webhooks/orders/create", express_1.default.json(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const order = {
        id: req.body.id,
        email: req.body.email,
        created_at: req.body.created_at,
        line_items: req.body.line_items.map((item) => ({
            id: item.product_id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
        })),
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
        yield sheets_controller_1.SheetsController.addOrderToSheet(order);
        // Respond to Shopify to acknowledge receipt of the webhook
        yield sheetsService.buildProcurement();
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