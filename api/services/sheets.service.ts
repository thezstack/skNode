import moment from "moment-timezone";
import { google, sheets_v4, Auth } from "googleapis";
import { Order } from "../models/order.model";
import { Product, CompletedProduct } from "../models/product.model";
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
  async processSpreadsheet(range: string, spreadsheetId: string) {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // First, read the data from the sheet
    const data = await this.readRange(spreadsheetId, range);

    // Assume the first row is the header row
    const headers = data[0];
    const coreSpreadSheetId = process.env.SHEETS_CORE_ID;
    const coreTargetRange = "CompletedProduct!A2:G";

    const dataToAppend = [];
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
          const rowObject: CompletedProduct = {
            product_id: headers[col],
            sku: data[row][0],
            product_description: data[row][1],
            quantity: data[row][col],
          };
          // Skip rows that don't have a corresponding header
          if (
            !rowObject.product_id ||
            !rowObject.sku ||
            !rowObject.product_description ||
            rowObject.sku == "SKU"
          ) {
            continue;
          }
          // console.log(`Processing cell (${row}, ${col}): ${data[row][col]}`);
          // console.log(`Row object:`, rowObject);
          dataToAppend.push(Object.values(rowObject));
        }
      }
    }
    try {
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: coreSpreadSheetId,
        range: coreTargetRange,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: dataToAppend },
      });
      // console.log(response);
    } catch (error) {
      console.error("Error posting data:", error);
      throw error;
    }
  }
  async processMultipleRange(spreadsheetId: string) {
    const range1 = process.env.SHEETS_SUPPLIES_HQA_RANGE;
    const range2 = process.env.SHEETS_SUPPLIES_ILM_RANGE;
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    try {
      const clearResponse = await sheets.spreadsheets.values.clear({
        spreadsheetId: process.env.SHEETS_CORE_ID,
        range: process.env.SHEETS_CORE_COMPLETEDPRODUCT_RANGE,
      });
      console.log(clearResponse);
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
    await Promise.all([
      this.processSpreadsheet(range1, spreadsheetId),
      this.processSpreadsheet(range2, spreadsheetId),
    ]);
  }
  async updateShopifyProducts() {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SHEETS_CORE_ID;
    const completedProductRange = "CompletedProduct!A2:D528"; // Replace with your actual range
    const productRange = "Products!A1:E22"; // Replace with your actual range

    const chunkSize = 200;
    const totalRows = 528;
    for (let startRow = 2; startRow <= totalRows; startRow = +chunkSize) {
      const endRow = startRow + chunkSize - 1;
      const range = `CompletedProduct!A${startRow}:E${endRow}`;
      const data = await this.readRange(spreadsheetId, range);
      console.log(data);
    }
    // Read data from both sheets
    const completedProductData = await this.readRange(
      spreadsheetId,
      completedProductRange
    );
    // console.log(completedProductData);
    const productData = await this.readRange(spreadsheetId, productRange);
    //console.log(productData);
    // Create a map where the keys are the IDs from the Product sheet and the values are the corresponding rows
    const productMap = productData.reduce((map: any, row: any) => {
      map[row[row.length - 1]] = row;
      return map;
    }, {});

    // Group the rows by ID
    const groupedRows = completedProductData.reduce((groups: any, row: any) => {
      const id = row[0];
      if (!groups[id]) {
        groups[id] = [];
      }
      groups[id].push(row);
      return groups;
    }, {});
    // Iterate over each group
    for (const id in groupedRows) {
      // Get the corresponding row from the Product sheet
      const productRow = productMap[id];

      // If a corresponding row is found, use the first column from the Product sheet as the ID to update your Shopify products
      if (productRow) {
        // Create a Product object and set its body_html property
        const product = {
          id: productRow[0],
          body_html: `<ul>${groupedRows[id]
            .map((row: any) => `<li>${row[2]} ${row[3]}</li>`)
            .join("")}</ul>`,
        };
        // Use the product to update your Shopify products
        // You might need to call a function here that takes the product as an argument and updates the Shopify products
        // console.log(`Updating Shopify product:`, product);
      }
    }
  }

  async trackSupplyChanges(data: any) {
    console.log(data);
  }
}
