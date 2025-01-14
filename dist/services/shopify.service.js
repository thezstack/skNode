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
exports.ShopifyService = void 0;
const axios_1 = __importDefault(require("axios"));
class ShopifyService {
    // ...other methods...
    fetchProducts() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const url = `${process.env.SHOP_URL}/admin/api/2023-04/products.json?fields=${fields}&status=active`;
            const headers = {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": process.env.SHOP_ACCESS_TOKEN,
            };
            try {
                const response = yield axios_1.default.get(url, { headers });
                return response.data.products;
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    fetchOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${process.env.SHOP_URL}/admin/api/2023-04/orders.json?status=any`;
            const headers = {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": process.env.SHOP_ACCESS_TOKEN,
            };
            try {
                const response = yield axios_1.default.get(url, { headers });
                return response.data.orders;
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    updateProducts(products) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    const response = yield axios_1.default.put(url, data, { headers });
                    console.log("Updated product:", response.data.product);
                }
                catch (error) {
                    console.error("Error updating product:", error);
                }
            }
        });
    }
}
exports.ShopifyService = ShopifyService;
//# sourceMappingURL=shopify.service.js.map