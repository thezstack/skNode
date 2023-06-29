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
    const range = "Sheet1!A2:E"; // This should be the name of your sheet
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
      console.error("Error adding product:", error);
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
    const range3 = process.env.SHEETS_SUPPLIES_IASW_RANGE;
    const range4 = process.env.SHEETS_SUPPLIES_IASE_RANGE;
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
      this.processSpreadsheet(range3, spreadsheetId),
      this.processSpreadsheet(range4, spreadsheetId),
    ]);
  }
  //Gets completed Products list for updating shopify products
  async getCompletedProductsForShopify() {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SHEETS_CORE_ID;
    const completedProductRange = "CompletedProduct!A2:D1138"; // Replace with your actual range
    const productRange = "Products!A1:E43"; // Replace with your actual range
    const completedProducts = [];
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
    console.log(productMap);
    // Group the rows by ID
    const groupedRows = completedProductData.reduce((groups: any, row: any) => {
      const id = row[0];
      if (!groups[id]) {
        groups[id] = [];
      }
      groups[id].push(row);
      return groups;
    }, {});
    //console.log(groupedRows);
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
            .map((row: any) => `<li>${row[2]} <strong>${row[3]}</strong></li>`)
            .join("")}</ul>`,
        };
        // Use the product to update your Shopify products
        // You might need to call a function here that takes the product as an argument and updates the Shopify products
        completedProducts.push(product);
        console.log(`Updating Shopify product:`, product);
      }
    }
    return completedProducts;
  }
  async trackSupplyChanges(data: any) {
    // Log the received data
    console.log(data);

    // Authenticate with the Google Sheets API
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // Define the ID of the spreadsheet and the range to search
    const spreadsheetId = process.env.SHEETS_CORE_ID;
    const range = "CompletedProduct!A2:B1138";

    // Get the values in the range
    const response = await this.readRange(spreadsheetId, range);
    // Find the row where the first column matches headerValue and the second column matches firstColumnValue
    const values = response || [];
    const rowIndex = values.findIndex(
      (row: any) => row[0] == data.product_id && row[1] == data.sku
    );

    //const rowIndex = values.findIndex((row: any) => console.log(row[0]));

    console.log(rowIndex);
    // If a matching row was found, update the fifth column of that row
    if (rowIndex !== -1) {
      const updateRange = `CompletedProduct!E${rowIndex + 1}`;

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: updateRange,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["true"]],
        },
      });
    }

    return data;
  }
  async createSheets(spreadsheetId: string, ids: string[]) {
    const auth = await this.getAuth();

    const sheets = google.sheets({ version: "v4", auth: auth });

    // Prepare the requests to add new sheets
    const requests = ids.map((id) => ({
      addSheet: {
        properties: {
          title: id,
        },
      },
    }));

    try {
      // Make the request to add new sheets
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error creating sheets:", error);
      throw error;
    }
  }
  /**
   * getting total product_id.
   *match those orders and grab all of the supplies related
   returns {
  '632910392': 3,
  '3850455973952': 4,
  '3391572869184': 1,
  '3391581814848': 2,
  '3820506415168': 1,
  '3852072091712': 1
}
   */
  async buildProcurement() {
    const procurementSheetID = "1925aTPEx32Sk8LuZJFNsAzz29SS7cWS4-G_5X0DNh9o";
    const prcurementRange = "SuppliesToOrder!D:D";
    const orderDumpSheet = process.env.GOOGLE_SPREADSHEET_ID;
    const dumpRange = "Dump!A2:I"; // Assuming data starts from row 2
    const dumpData = await this.readRange(orderDumpSheet, dumpRange);
    //console.log(dumpData);
    //Create an object with unique ids and their total count
    const idCountMap = dumpData.reduce((map: any, row: any) => {
      const id = row[8]; // ID is in column I
      const count = parseInt(row[4]); // Count is in column E
      if (!isNaN(count)) {
        // Check if count is a valid number
        if (!map[id]) {
          map[id] = 0;
        }
        map[id] += count;
      }
      return map;
    }, {});
    console.log(idCountMap);
    await this.matchIdsAndGetData(idCountMap);
    //console.log(idCountMap);
    // return idCountMap;
  }
  //match total orders with completed supply list
  async matchIdsAndGetData(idCountMap: any) {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1QETHsfANGwEJG00CR-zkQ6SWi2jSkn2SpuxBrQXhN5U";
    const completedProductRange = "CompletedProduct!A2:E"; // Assuming data starts from row 2

    // Read data from "CompletedProduct" sheet
    const completedProductData = await this.readRange(
      spreadsheetId,
      completedProductRange
    );

    // Create an array with required data for each matching ID
    const matchedData = completedProductData.reduce((arr: any, row: any) => {
      const id = row[4]; // ID is in column E
      const sku = row[1]; // Value in column B
      const quantity = row[3] * idCountMap[id]; // Value in column D

      // If the ID exists in idCountMap, add the required data to the array
      if (idCountMap[id]) {
        const obj = {
          id,
          sku: sku,
          quantity: quantity,
        };
        arr.push(obj);
      }

      return arr;
    }, []);

    console.log("matchedData", matchedData[0]);
    await this.updateDataWithSupplies(matchedData);
    //return matchedData;
  }
  async updateDataWithSupplies(matchedData: any[]) {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1925aTPEx32Sk8LuZJFNsAzz29SS7cWS4-G_5X0DNh9o";
    const suppliesRange = "SuppliesToOrder!A2:D"; // Assuming data starts from row 2

    // Read data from "SuppliesToOrder" sheet
    let suppliesData = await this.readRange(spreadsheetId, suppliesRange);

    const matchedDataMap = matchedData.reduce((map: any, data: any) => {
      // If this SKU already exists in the map, accumulate the quantity
      if (map[data.sku]) {
        map[data.sku].quantity += data.quantity;
      } else {
        // else, add a new entry to the map
        map[data.sku] = data;
      }
      return map;
    }, {});
    // Update suppliesData based on the data from matchedData
    suppliesData = suppliesData.map((row: any[]) => {
      const sku = row[1]; // SKU is in column B
      //  console.log(sku);
      const matchedDataItem = matchedDataMap[sku];
      if (matchedDataItem) {
        // console.log(matchedDataItem);
        row[3] = matchedDataItem.quantity; // Update column D with quantity from matchedData
      }
      return row;
    });
    //   console.log(suppliesData[3]);
    // Update the "SuppliesToOrder" sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: suppliesRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: suppliesData,
      },
    });

    //return matchedData;
  }
}
