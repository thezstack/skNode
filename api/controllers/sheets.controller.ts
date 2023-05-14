import { Order } from "../models/order.model";
import { SheetsService } from "../services/sheets.service";

export class SheetsController {
  static async addOrderToSheet(order: Order) {
    console.log("inside SheetsControlle");
    const sheetsService = new SheetsService();

    return sheetsService.addOrder(order);
  }
}
