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
  //Gets completed Products list for updating shopify products
  async getCompletedProductsForShopify() {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.SHEETS_CORE_ID;
    const completedProductRange = "CompletedProduct!A2:D550"; // Replace with your actual range
    const productRange = "Products!A1:E23"; // Replace with your actual range
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
    const range = "CompletedProduct!A2:B536";

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
  // async groupDataById(data: any[]) {
  //   return data.reduce((groups: any, row: any) => {
  //     const id = row[0];
  //     if (!groups[id]) {
  //       groups[id] = [];
  //     }
  //     groups[id].push(row);
  //     return groups;
  //   }, {});
  // }
/**
 * getting total product_id.
 *match those orders and grab all of the supplies related
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
    this.matchIdsAndGetData(idCountMap);
    //console.log(idCountMap);
    // return idCountMap;
  }

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

    console.log(matchedData);
    this.updateDataWithSupplies(matchedData);
    //return matchedData;
  }

  // async updateDataWithSupplies(matchedData: any[]) {
  //   const auth = await this.getAuth();
  //   const sheets = google.sheets({ version: "v4", auth });
  //   const spreadsheetId = "1925aTPEx32Sk8LuZJFNsAzz29SS7cWS4-G_5X0DNh9o";
  //   const suppliesRange = "SuppliesToOrder!A2:D"; // Assuming data starts from row 2

  //   // Read data from "SuppliesToOrder" sheet
  //   const suppliesData = await this.readRange(spreadsheetId, suppliesRange);

  //   // Create a map where the keys are the columnB values and the values are the corresponding rows
  //   const suppliesMap = suppliesData.reduce((map: any, row: any) => {
  //     const columnB = row[1]; // columnB equivalent is in column D
  //     if (!map[columnB]) {
  //       map[columnB] = row;
  //     }
  //     return map;
  //   }, {});
  //   //console.log(suppliesMap);

  //   // Update matchedData based on the data from the "SuppliesToOrder" sheet
  //   matchedData.forEach((data: any) => {
  //     const suppliesRow = suppliesMap[data.sku];
  //     if (suppliesRow) {
  //       const currentValue = parseInt(suppliesRow[3]); // The current value is in column D
  //       if (!isNaN(currentValue)) {
  //         data.quantity += currentValue;
  //       }
  //     }
  //   });

  //   console.log(matchedData);
  //   // this.updateSupplyQuantities(matchedData);
  //   // return matchedData;
  // }
  async updateDataWithSupplies(matchedData: any[]) {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1925aTPEx32Sk8LuZJFNsAzz29SS7cWS4-G_5X0DNh9o";
    const suppliesRange = "SuppliesToOrder!A2:D"; // Assuming data starts from row 2

    // Read data from "SuppliesToOrder" sheet
    let suppliesData = await this.readRange(spreadsheetId, suppliesRange);

    // Convert matchedData to map for easy lookup
    const matchedDataMap = matchedData.reduce((map: any, data: any) => {
      map[data.sku] = data;
      return map;
    }, {});

    // Update suppliesData based on the data from matchedData
    suppliesData = suppliesData.map((row: any[]) => {
      const sku = row[1]; // SKU is in column B
      const matchedDataItem = matchedDataMap[sku];
      if (matchedDataItem) {
        row[3] = matchedDataItem.quantity; // Update column D with quantity from matchedData
      }
      return row;
    });

    // Update the "SuppliesToOrder" sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: suppliesRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: suppliesData,
      },
    });

    console.log(matchedData);
    return matchedData;
  }

  async updateSupplyQuantities(matchedData: any[]) {
    const auth = await this.getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1925aTPEx32Sk8LuZJFNsAzz29SS7cWS4-G_5X0DNh9o";
    const suppliesRange = "SuppliesToOrder!A2:D"; // Assuming data starts from row 2

    // Read data from "SuppliesToOrder" sheet
    let suppliesData = await this.readRange(spreadsheetId, suppliesRange);

    // Convert matchedData to map for easy lookup
    const matchedDataMap = matchedData.reduce((map: any, data: any) => {
      map[data.id] = data;
      return map;
    }, {});

    console.log(matchedDataMap);

    // Update suppliesData based on the data from matchedData
    suppliesData = suppliesData.map((row: any[]) => {
      const id = row[1]; // ID is in column B
      const matchedDataItem = matchedDataMap[id];
      if (matchedDataItem) {
        row[3] = matchedDataItem.quantity; // Update column D with quantity from matchedData
      }
      return row;
    });
    console.log("suppliesData", suppliesData[0]);
    // Update the "SuppliesToOrder" sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: suppliesRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: suppliesData,
      },
    });
  }

  // async updateSpreadsheet(matchedData: any[], spreadsheetId: string, range: string) {
  //   const auth = await this.getAuth();
  //   const sheets = google.sheets({ version: "v4", auth });

  //   // Prepare the data for update
  //   const values = matchedData.map(data => [data.id, data.columnB, data.columnD, data.count]);

  //   // Update the spreadsheet
  //   await sheets.spreadsheets.values.update({
  //     spreadsheetId,
  //     range,
  //     requestBody: {
  //       values,
  //     },
  //     valueInputOption: 'USER_ENTERED',
  //   });
  // }

  // async getCompletedProductsForSheets() {
  //   const auth = await this.getAuth();
  //   const sheets = google.sheets({ version: "v4", auth });
  //   const spreadsheetId = process.env.SHEETS_CORE_ID;
  //   const completedProductRange = "CompletedProduct!A2:D550";
  //   const productRange = "Products!A1:E23";

  //   const ranges = [completedProductRange, productRange];
  //   const response = await sheets.spreadsheets.values.batchGet({
  //     spreadsheetId,
  //     ranges,
  //   });
  //   const [completedProductData, productData] = response.data.valueRanges.map(
  //     (range) => range.values
  //   );

  //   const productMap = productData.reduce((map: any, row: any) => {
  //     map[row[row.length - 1]] = row;
  //     return map;
  //   }, {});

  //   const groupedRows = await this.groupDataById(completedProductData);

  //   // Now you can use this groupedRows object to write data into your sheets
  //   // Let's assume each group goes into a different sheet and the sheet's ID is the group's ID
  //   for (const id in groupedRows) {
  //     const range = `${id}!A1:E23`; // You need to define the range properly
  //     const data = groupedRows[id];
  //     await this.writeToSheet(auth, spreadsheetId, range, data);
  //   }
  // }

  // async writeToSheet(auth: any, spreadsheetId: any, range: any, data: any[]) {
  //   const sheets = google.sheets({ version: "v4", auth });
  //   const resource = {
  //     values: data,
  //   };
  //   sheets.spreadsheets.values.update({
  //     spreadsheetId,
  //     range,
  //     resource,
  //     valueInputOption: 'USER_ENTERED',
  //   });
  // }
}
