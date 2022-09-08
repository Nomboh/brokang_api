import express from "express";
import {
  createCheckoutSession,
  getCards,
  paymentIntent,
  renderMe,
  setupIntent,
  updatePaymentIntent,
  webhook,
} from "../controllers/stripeController.js";
import { verifyToken } from "../utils/verify.js";

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);

router.post("/create-payment-intent", verifyToken, paymentIntent);

router.post("/webhook", webhook);

router.post("/save-payment-method", verifyToken, setupIntent);

router.post("/update-payment-intent", verifyToken, updatePaymentIntent);

router.get("/get-payment-methods", verifyToken, getCards);

router.get("/me/read", verifyToken, renderMe);

export default router;
