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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SheetsService = void 0;
const googleapis_1 = require("googleapis");
class SheetsService {
    addOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = new googleapis_1.google.auth.JWT(process.env.GOOGLE_CLIENT_EMAIL, undefined, "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmH9tICzkNlz7O\nvCNDZw/GZcYxCsPCvCn9rWS3F4q3U0C+JIH1L9z3cRQRs1lxhU4plkYR9AyZayJi\n9hotCmgRSK7KXcYF66eVFKtFFXXTRNFRAl0Mn+sthToY1tqJUS3cOrO+VrppKTzc\nrRIcm3xQAKr47dyPl7Han+z/3/xXogKos5LuOOrH+ScZcbZM5LdGRpqHOh1AzOUO\nqo5QNuibx+z5NA0fOP0ZOgJ1E8VhMgajDR9FbHPzot8QbzTZXP/4Ehg4c5Y2HV3Q\nD1MYUQSNMherKSKCt71JnsM4xsqM2d1RH3UxdbYEQlcVb/ze1w6gWMN8kxC1Jaf+\nBfxS/aYjAgMBAAECggEAGMqzSnamTpFuRaMNLi9wyr6Ai+wb1/GF4L5iQ/LG+GH7\nzQScwm8grmrZQGUAKbFnv0wWa/J8eN7ktFkfAe7GJiIvN7Mz7MlE6ro5bydrPJrO\nFCVippItIk96Ip/Z4FlVm0LFdVfzHOOTGinYBJ3tuPDIkzrISkOsvsBUOcF/IsKk\nnLxQNQRydUWORLm+HmW21IPbcGo9Fj7k0hW0uEGG7Grmu/09HLitz59SQsCHkHge\nzP3ccFbl/e3/+jMG43wE1LzAhhLoF7OnNFYo7odWMAY99tzocxWZU0sPIehKpuWs\nVJO5lhG2SjgDc3mBbcQMYamQvDlZGxYcaON2Umhh3QKBgQDfQ2RlW4c7AZ6IfFQE\nSuMPY8LQMKjc0aSV7Hb7snV639twIameHNx+efkEy5YaQjqcYPF9cTI+9PiqQSyg\nJcenDvSDJdX+2DMraHtPFKyAVHxdpIZXV3S0OWolh/+JewL89g7N81e5saQXlAXX\n6SJUEfhP/UURRe/szCCBG9W0dwKBgQC+e6a1B9jljsj7wvN0J1ylRkLTjru4RlNg\nqHMulAMfPPSpyVd+zn0lgMUph1avsD5NPaduoFqM0JkQfLtO/5i94p9B1565uy5s\nWvPYwYFzNjLuzdqGLFIWjyD8rcUvUYNzw54mBj1iu33W7O16RMDvb7BCjnHIZ3g6\nTGbHKgzitQKBgDOeMSf98VYDGdQUaphTeAum1POtTF1BWvwOn7Oxnte5ydIy9jRI\nF/Jl4Nzq9Nk9Vq+w+iQ2d5d2q8cxKlAca/yDyKRJqyAwfCQdE+VEsl05K0e7MhQf\ndCv22kOzHbF7b0Vs3h9fk3irSXTqFC/HBtjJDs/vjnhf4wisaRdwiAghAoGBAIPN\nw9jYCTkux9uNVjA1XGHwcCU7SqGD6AWmCa1dNZvT7efeLfDMqMPeio7l2xHOfg2s\nb8KYqo9td7x00pcjPWmG+nPw4x/ZaZIIjVqa6xvxkOS1BFR7LoH1n/m3tA299ZuQ\n7EmbX7aFzdl+MAS+tlH3kps7PXhSQFr2qtd9PVVRAoGAS/lhPbvtGlK2Krz7786O\nPO52wPm1PFn3+3DppjUrwxjRiPtSfZapvVO+vsJ2l5E33FLUslPjxHwrLfCpokVz\nBr0tq+XoITshCj0LqCSwczgl0SW/8CdJ58Dq4mE5BR57RCy/7aXhWcG95F/8lcfb\n9OAyNQ9tJLpu7su5CiUucKM=\n-----END PRIVATE KEY-----\n", ["https://www.googleapis.com/auth/spreadsheets"]);
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
                    order.created_at,
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
            const auth = new googleapis_1.google.auth.JWT(process.env.GOOGLE_CLIENT_EMAIL, undefined, "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmH9tICzkNlz7O\nvCNDZw/GZcYxCsPCvCn9rWS3F4q3U0C+JIH1L9z3cRQRs1lxhU4plkYR9AyZayJi\n9hotCmgRSK7KXcYF66eVFKtFFXXTRNFRAl0Mn+sthToY1tqJUS3cOrO+VrppKTzc\nrRIcm3xQAKr47dyPl7Han+z/3/xXogKos5LuOOrH+ScZcbZM5LdGRpqHOh1AzOUO\nqo5QNuibx+z5NA0fOP0ZOgJ1E8VhMgajDR9FbHPzot8QbzTZXP/4Ehg4c5Y2HV3Q\nD1MYUQSNMherKSKCt71JnsM4xsqM2d1RH3UxdbYEQlcVb/ze1w6gWMN8kxC1Jaf+\nBfxS/aYjAgMBAAECggEAGMqzSnamTpFuRaMNLi9wyr6Ai+wb1/GF4L5iQ/LG+GH7\nzQScwm8grmrZQGUAKbFnv0wWa/J8eN7ktFkfAe7GJiIvN7Mz7MlE6ro5bydrPJrO\nFCVippItIk96Ip/Z4FlVm0LFdVfzHOOTGinYBJ3tuPDIkzrISkOsvsBUOcF/IsKk\nnLxQNQRydUWORLm+HmW21IPbcGo9Fj7k0hW0uEGG7Grmu/09HLitz59SQsCHkHge\nzP3ccFbl/e3/+jMG43wE1LzAhhLoF7OnNFYo7odWMAY99tzocxWZU0sPIehKpuWs\nVJO5lhG2SjgDc3mBbcQMYamQvDlZGxYcaON2Umhh3QKBgQDfQ2RlW4c7AZ6IfFQE\nSuMPY8LQMKjc0aSV7Hb7snV639twIameHNx+efkEy5YaQjqcYPF9cTI+9PiqQSyg\nJcenDvSDJdX+2DMraHtPFKyAVHxdpIZXV3S0OWolh/+JewL89g7N81e5saQXlAXX\n6SJUEfhP/UURRe/szCCBG9W0dwKBgQC+e6a1B9jljsj7wvN0J1ylRkLTjru4RlNg\nqHMulAMfPPSpyVd+zn0lgMUph1avsD5NPaduoFqM0JkQfLtO/5i94p9B1565uy5s\nWvPYwYFzNjLuzdqGLFIWjyD8rcUvUYNzw54mBj1iu33W7O16RMDvb7BCjnHIZ3g6\nTGbHKgzitQKBgDOeMSf98VYDGdQUaphTeAum1POtTF1BWvwOn7Oxnte5ydIy9jRI\nF/Jl4Nzq9Nk9Vq+w+iQ2d5d2q8cxKlAca/yDyKRJqyAwfCQdE+VEsl05K0e7MhQf\ndCv22kOzHbF7b0Vs3h9fk3irSXTqFC/HBtjJDs/vjnhf4wisaRdwiAghAoGBAIPN\nw9jYCTkux9uNVjA1XGHwcCU7SqGD6AWmCa1dNZvT7efeLfDMqMPeio7l2xHOfg2s\nb8KYqo9td7x00pcjPWmG+nPw4x/ZaZIIjVqa6xvxkOS1BFR7LoH1n/m3tA299ZuQ\n7EmbX7aFzdl+MAS+tlH3kps7PXhSQFr2qtd9PVVRAoGAS/lhPbvtGlK2Krz7786O\nPO52wPm1PFn3+3DppjUrwxjRiPtSfZapvVO+vsJ2l5E33FLUslPjxHwrLfCpokVz\nBr0tq+XoITshCj0LqCSwczgl0SW/8CdJ58Dq4mE5BR57RCy/7aXhWcG95F/8lcfb\n9OAyNQ9tJLpu7su5CiUucKM=\n-----END PRIVATE KEY-----\n", ["https://www.googleapis.com/auth/spreadsheets"]);
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
}
exports.SheetsService = SheetsService;
//# sourceMappingURL=sheets.service.js.map