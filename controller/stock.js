import axios from "axios";
import dotenv from "dotenv";
import { createMessages } from "../providers/openai.js";

// Create axios instance with proper configuration
const API = axios.create({
  baseURL: process.env.YAHOO_LINK,
  timeout: 5000 // 5 second timeout
});

// Validate stock symbol format
function isValidStockSymbol(symbol) {
  return typeof symbol === 'string' && /^[A-Z0-9.]{1,10}$/.test(symbol);
}

export const testFunc = (req, res) => {
  const { name } = req.body;
  // Avoid logging direct user input
  console.log("Test endpoint called");
  res.status(200).json({
    message: `Hello ${name ? name.substring(0, 30) : "World"}`,
  });
};

export const getStockData = async (req, res) => {
  try {
    const { symbol, period1, period2 } = req.body;

    // Validate input
    if (!isValidStockSymbol(symbol)) {
      return res.status(400).json({
        message: "Invalid stock symbol format",
      });
    }

    // Use provided periods or default to reasonable values
    const startDate = period1 || Math.floor(Date.now() / 1000) - 2592000; // Default: 30 days ago
    const endDate = period2 || Math.floor(Date.now() / 1000);

    console.log(`Retrieving stock data for ${symbol}`);

    const stock = await API.get(
      `${symbol}?symbol=${symbol}&period1=${startDate}&period2=${endDate}&interval=1d&events=history%7Csplit`
    );

    if (!stock || !stock.data) {
      return res.status(404).json({
        message: "No data found",
      });
    }

    return res.status(200).json({
      message: "Success",
      data: stock.data,
    });
  } catch (e) {
    console.error("Stock data error:", e.message);
    return res.status(e.response?.status || 500).json({
      message: "Error retrieving stock data",
      error: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};
