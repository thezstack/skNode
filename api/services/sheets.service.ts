// services/SheetsService.ts
import { Order } from "../models/order.model";
import { google } from "googleapis";

export class SheetsService {
  async addOrder(order: Order) {
    // Here you should implement the logic to add data to Google Sheets
    // You could use the Google Sheets API for this
    console.log("inside SheetsService");
    // Load client secrets from a local file.
    const credentials = {
      installed: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        project_id: process.env.GOOGLE_PROJECT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
      },
    };

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // Assuming you have a valid token.json in your project root with
    // an access token, expiry date and refresh token
    const token = require("../../token.json");
    oAuth2Client.setCredentials(token);

    const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

    // The ID and range of the spreadsheet.
    const spreadsheetId = process.env.GOOGLE_ORDERDUMP_ID; // Replace with your Spreadsheet ID
    const range = "Sheet1!A1:E5"; // Update this to your specific range

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    console.log(response);
    // TODO: Add the order data to Google Sheets
    // This will depend on the structure of your Google Sheets document and the structure of the order data
  }
}
