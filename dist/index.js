"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shopify_controller_1 = require("./controllers/shopify.controller"); // Adjust the path to match your file structure
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware to parse JSON request bodies
app.use(express_1.default.json());
// Use the Shopify router for requests to /shopify
app.use("/shopify", shopify_controller_1.shopifyRouter);
app.get("/", (req, res) => {
    res.json({ message: "Please Like the Video!" });
});
app.listen(process.env.PORT || 3000);
//# sourceMappingURL=index.js.map