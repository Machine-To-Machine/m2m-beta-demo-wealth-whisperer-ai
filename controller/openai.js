import axios from "axios";
import dotenv from "dotenv";
import { VerifiableCredential } from "@web5/credentials";
import { createMessages } from "../providers/openai.js";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Load environment variables
dotenv.config();

// Get log file location from env or use default
const LOG_FILE = process.env.LOG_FILE_PATH || path.join(process.cwd(), "logs", "queries.log");
const LOG_SEPARATOR = "**";

// Ensure log directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

// Validate and sanitize user input
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.slice(0, 500).trim(); // Limit question length
}

// Read stock symbols from environment or use defaults
const symbols = process.env.STOCK_SYMBOLS ?
  process.env.STOCK_SYMBOLS.split(',') :
  ["TSLA", "AAPL", "GOOGL", "AMZN", "MSFT", "NFLX"];

// Load VC from environment variables if provided
const getVC = () => {
  try {
    if (process.env.VC_DATA) {
      return JSON.parse(process.env.VC_DATA);
    }
    // Fallback to minimal credential structure if not configured
    return {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential"],
      "id": process.env.VC_ID || "",
      "issuer": process.env.VC_ISSUER || "",
      "issuanceDate": new Date().toISOString(),
      "credentialSubject": {
        "id": process.env.VC_SUBJECT_ID || "",
      }
    };
  } catch (error) {
    console.error("Error parsing VC data from environment:", error);
    return {};
  }
};

const VC = getVC();

export const testFunc = (req, res) => {
  res.send("Hello World");
};

export const getChatAnswer = async (req, res) => {
  const { question } = req.body;
  console.log("question", question);
  const answer = await createMessages(question);
  res.send({
    message: answer,
  });
};

export const apiForChat = async (req, res) => {
  try {
    const { question } = req.body;

    // Validate input
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ message: "Invalid question format" });
    }

    const sanitizedQuestion = sanitizeInput(question);
    console.log(`Chat request received, length: ${sanitizedQuestion.length}`);

    // Determine response type based on question content
    const isFinanceRelated = ['financial', 'finance', 'business'].some(
      term => sanitizedQuestion.toLowerCase().includes(term)
    );

    const answer = await createMessages(
      sanitizedQuestion,
      isFinanceRelated ? "finance" : "chat"
    );

    if (!answer) {
      return res.status(500).json({ message: "Failed to generate response" });
    }

    return res.status(200).json({
      message: answer,
      data: null,
    });
  } catch (e) {
    console.error("Chat error:", e.message);
    return res.status(500).json({
      message: "An error occurred processing your request",
      error: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};

export const apiForFinance = async (req, res) => {
  try {
    const { info } = req.body;

    // Validate input
    if (!info || !info.question || typeof info.question !== 'string') {
      return res.status(400).json({ message: "Invalid question format" });
    }

    const sanitizedQuestion = sanitizeInput(info.question);
    console.log(`Finance request received, length: ${sanitizedQuestion.length}`);

    const answer = await createMessages(sanitizedQuestion, "finance");

    if (!answer) {
      return res.status(500).json({ message: "Failed to generate response" });
    }

    // Store log securely
    await storeLog(sanitizedQuestion);

    return res.status(200).json({
      message: "Finance data processed successfully",
      data: { answer }
    });
  } catch (error) {
    console.error("Finance error:", error.message);
    return res.status(500).json({
      message: "An error occurred processing your finance request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const storeLog = async (question) => {
  try {
    // Create log entry with secure data handling
    const log = {
      question: question.substring(0, 200), // Limit stored question length
      hash: crypto.createHash('sha256').update(question).digest('hex').slice(0, 10),
      timestamp: new Date().toISOString(),
    };

    // Append to log file with proper error handling
    await fs.promises.appendFile(LOG_FILE, JSON.stringify(log) + LOG_SEPARATOR);
    console.log(`Log entry created [${log.hash}]`);
  } catch (err) {
    console.error("Log storage error:", err.message);
  }
};

export const fetchLog = async (req, res) => {
  try {
    // Check if log file exists
    if (!fs.existsSync(LOG_FILE)) {
      return res.status(200).json({
        message: "No logs found",
        data: []
      });
    }

    const logs = await fs.promises.readFile(LOG_FILE, "utf8");
    const logArr = logs.split(LOG_SEPARATOR);
    const logsData = logArr
      .filter(log => log.trim() !== "")
      .map(log => {
        try {
          return JSON.parse(log);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    return res.status(200).json({
      message: "Logs retrieved successfully",
      data: logsData,
    });
  } catch (error) {
    console.error("Log retrieval error:", error.message);
    return res.status(500).json({ message: "Error retrieving logs" });
  }
};

export const clearLog = async (req, res) => {
  try {
    // Check if log file exists
    if (!fs.existsSync(LOG_FILE)) {
      return res.status(200).json({ message: "No logs to clear" });
    }

    await fs.promises.writeFile(LOG_FILE, "");
    console.log("Log cleared");
    return res.status(200).json({ message: "Logs cleared successfully" });
  } catch (error) {
    console.error("Log clearing error:", error.message);
    return res.status(500).json({ message: "Error clearing logs" });
  }
};