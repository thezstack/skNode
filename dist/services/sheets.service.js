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
exports.SheetsService = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const googleapis_1 = require("googleapis");
class SheetsService {
    constructor() {
        this.auth = null;
    }
    getAuth() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.auth) {
                this.auth = new googleapis_1.google.auth.JWT(process.env.GOOGLE_CLIENT_EMAIL, undefined, process.env.GOOGLE_AUTH_KEY.replace(/\\n/gm, "\n"), ["https://www.googleapis.com/auth/spreadsheets"]);
            }
            return this.auth;
        });
    }
    addOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: "v4", auth });
            const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
            const range = "Dump"; // This should be the name of your sheet
            // Prepare the data
            const data = [];
            for (const item of order.line_items) {
                const row = [
                    order.order_number,
                    order.customer.first_name,
                    order.customer.last_name,
                    order.customer.email,
                    item.quantity,
                    item.title,
                    order.notes,
                    (0, moment_timezone_1.default)(order.created_at)
                        .tz("America/Chicago")
                        .format("MM/DD/YYYY HH:mm:ss"),
                    item.id,
                ];
                data.push(row);
            }
            try {
                const response = yield sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: "USER_ENTERED",
                    insertDataOption: "INSERT_ROWS",
                    requestBody: { values: data },
                });
                console.log(response);
            }
            catch (error) {
                console.error("Error adding order:", error);
                throw error;
            }
        });
    }
    readRange(spreadsheetId, range) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: "v4", auth });
            try {
                const response = yield sheets.spreadsheets.values.get({
                    spreadsheetId,
                    range,
                });
                if (!response.data.values || response.data.values.length === 0) {
                    console.log("No data found.");
                }
                else {
                    console.log("Data:", response.data.values);
                }
                return response.data.values;
            }
            catch (error) {
                console.error("Error reading range:", error);
                throw error;
            }
        });
    }
    addProduct(product) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: "v4", auth });
            const spreadsheetId = process.env.GOOGLE_PRODUCT_ID;
            const range = "Sheet1"; // This should be the name of your sheet
            // Prepare the data
            const data = [];
            for (const item of product) {
                const row = [
                    item.id,
                    item.body_html,
                    (0, moment_timezone_1.default)(item.created_at)
                        .tz("America/Chicago")
                        .format("MM/DD/YYYY HH:mm:ss"),
                    item.product_type,
                    item.status,
                    item.title,
                    (0, moment_timezone_1.default)(item.updated_at)
                        .tz("America/Chicago")
                        .format("MM/DD/YYYY HH:mm:ss"),
                    item.variants[0].id,
                    item.variants[0].price,
                ];
                data.push(row);
            }
            try {
                const response = yield sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: "USER_ENTERED",
                    insertDataOption: "INSERT_ROWS",
                    requestBody: { values: data },
                });
                console.log(response);
            }
            catch (error) {
                console.error("Error adding order:", error);
                throw error;
            }
        });
    }
    createCompletedProduct() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.SheetsService = SheetsService;
//# sourceMappingURL=sheets.service.js.map