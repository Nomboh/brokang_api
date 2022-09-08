import express from "express";
import { verifyToken } from "../utils/verify.js";
import {
  createConversation,
  getConversation,
  getUsersConversation,
} from "../controllers/conversation.js";

const router = express.Router();

router.use("*", verifyToken);

router.post("/", createConversation);
router.get("/:id", getConversation);
router.get("/", getUsersConversation);

export default router;
