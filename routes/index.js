import express from "express";
import { getStockData, testFunc } from "../controller/stock.js";
import { apiForChat, apiForFinance, fetchLog, getChatAnswer, clearLog } from "../controller/openai.js";
import { verifyToken } from "../middleware/vc.js";

const router = express.Router();

// Test routes
router.post("/test", testFunc);

// Stock data routes
router.post("/stock", verifyToken, getStockData);

// Chat routes
router.post("/chat", apiForChat);
router.post('/finance', verifyToken, apiForFinance);

// Log management - these should be protected
router.get('/log', verifyToken, fetchLog);
router.delete('/log', verifyToken, clearLog);

export default router;