import express from "express";
import { verifyToken } from "../utils/verify.js";
import {
  createConversation,
  getUsersConversation,
  getConversation,
} from "../controllers/conversation.js";

const router = express.Router();

router.use("*", verifyToken);

router.post("/", createConversation);
router.get("/", getUsersConversation);
router.get("/:id", getConversation);

export default router;
