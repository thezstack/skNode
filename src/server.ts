import express, { Request, Response } from "express";
import { shopifyRouter } from "./controllers/shopify.controller"; // Adjust the path to match your file structure
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Use the Shopify router for requests to /shopify
app.use("/shopify", shopifyRouter);

app.get("/", (req: Request, res: Response): void => {
  res.json({ message: "Please Like the Video!" });
});

app.listen("3001", (): void => {
  console.log("Server Running!");
});
