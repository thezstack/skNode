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
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.sheetsRouter = router;
const sheetsService = new sheets_service_1.SheetsService();
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
class SheetsController {
    static addOrderToSheet(order) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("inside SheetsControlle");
            return sheetsService.addOrder(order);
        });
    }
}
exports.SheetsController = SheetsController;
//# sourceMappingURL=sheets.controller.js.map