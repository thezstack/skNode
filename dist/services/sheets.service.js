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
    processSpreadsheet(range, spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: "v4", auth });
            // First, read the data from the sheet
            const data = yield this.readRange(spreadsheetId, range);
            // Assume the first row is the header row
            const headers = data[0];
            const coreSpreadSheetId = process.env.SHEETS_CORE_ID;
            const coreTargetRange = "CompletedProduct!A2:G";
            const dataToAppend = [];
            console.log(headers);
            // Iterate over each column
            for (let col = 0; col < headers.length; col++) {
                // Skip columns with null headers
                if (headers[col] === null) {
                    continue;
                }
                // Iterate over each row in the current column, starting from the second row
                for (let row = 1; row < data.length; row++) {
                    // If the cell value is "false", move on to the next column
                    if (data[row][col] === "FALSE") {
                        break;
                    }
                    // If the cell has a value, create an object that maps the headers to the values in the row
                    if (data[row][col]) {
                        const rowObject = {
                            id: headers[col],
                            sku: data[row][0],
                            name: data[row][1],
                            quantity: data[row][col],
                        };
                        // Skip rows that don't have a corresponding header
                        if (!rowObject.id ||
                            !rowObject.sku ||
                            !rowObject.name ||
                            rowObject.sku == "SKU") {
                            continue;
                        }
                        // console.log(`Processing cell (${row}, ${col}): ${data[row][col]}`);
                        // console.log(`Row object:`, rowObject);
                        dataToAppend.push(Object.values(rowObject));
                    }
                }
            }
            try {
                const response = yield sheets.spreadsheets.values.append({
                    spreadsheetId: coreSpreadSheetId,
                    range: coreTargetRange,
                    valueInputOption: "USER_ENTERED",
                    insertDataOption: "INSERT_ROWS",
                    requestBody: { values: dataToAppend },
                });
                // console.log(response);
            }
            catch (error) {
                console.error("Error posting data:", error);
                throw error;
            }
        });
    }
    processMultipleRange(spreadsheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const range1 = process.env.SHEETS_SUPPLIES_HQA_RANGE;
            const range2 = process.env.SHEETS_SUPPLIES_ILM_RANGE;
            const auth = yield this.getAuth();
            const sheets = googleapis_1.google.sheets({ version: "v4", auth });
            try {
                const clearResponse = yield sheets.spreadsheets.values.clear({
                    spreadsheetId: process.env.SHEETS_CORE_ID,
                    range: process.env.SHEETS_CORE_COMPLETEDPRODUCT_RANGE,
                });
                console.log(clearResponse);
            }
            catch (error) {
                console.error("Error clearing data:", error);
                throw error;
            }
            yield Promise.all([
                this.processSpreadsheet(range1, spreadsheetId),
                this.processSpreadsheet(range2, spreadsheetId),
            ]);
        });
    }
}
exports.SheetsService = SheetsService;
//# sourceMappingURL=sheets.service.js.map