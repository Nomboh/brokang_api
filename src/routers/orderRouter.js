import express from "express";
import { getOrder } from "../controllers/orderController.js";
import { verifyToken } from "../utils/verify.js";

const router = express.Router();

router.get("/get-orders/:id", verifyToken, getOrder);

export default router;
