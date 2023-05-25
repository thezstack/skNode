import moment from "moment-timezone";
import { google, sheets_v4, Auth } from "googleapis";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
export class SheetsService {
  private auth: Auth.OAuth2Client | null = null;

  private async getAuth() {
    if (!this.auth) {
      this.auth = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        undefined,
        process.env.GOOGLE_AUTH_KEY.replace(/\\n/gm, "\n"),
        ["https://www.googleapis.com/auth/spreadsheets"]
      );
    }

    return this.auth;
  }
  async addOrder(order: Order) {
    const auth = await this.getAuth();

    const sheets = google.sheets({ version: "v4", auth });

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
        moment(order.created_at)
          .tz("America/Chicago")
          .format("MM/DD/YYYY HH:mm:ss"),
        item.id,
      ];
      data.push(row);
    }

    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: data },
      });
      console.log(response);
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  }
  async readRange(spreadsheetId: string, range: string): Promise<any> {
    const auth = await this.getAuth();

    const sheets = google.sheets({ version: "v4", auth });

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      if (!response.data.values || response.data.values.length === 0) {
        console.log("No data found.");
      } else {
        console.log("Data:", response.data.values);
      }

      return response.data.values;
    } catch (error) {
      console.error("Error reading range:", error);
      throw error;
    }
  }
  async addProduct(product: Product[]) {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_PRODUCT_ID;
    const range = "Sheet1"; // This should be the name of your sheet
    // Prepare the data
    const data = [];
    for (const item of product) {
      const row = [
        item.id,
        item.body_html,
        moment(item.created_at)
          .tz("America/Chicago")
          .format("MM/DD/YYYY HH:mm:ss"),
        item.product_type,
        item.status,
        item.title,
        moment(item.updated_at)
          .tz("America/Chicago")
          .format("MM/DD/YYYY HH:mm:ss"),
        item.variants[0].id,
        item.variants[0].price,
      ];
      data.push(row);
    }

    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: data },
      });
      console.log(response);
    } catch (error) {
      console.error("Error adding order:", error);
      throw error;
    }
  }
}
