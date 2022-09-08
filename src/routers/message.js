import express from "express";
import {
  createMessage,
  delMessages,
  getMessages,
} from "../controllers/message.js";
import { verifyToken } from "../utils/verify.js";

const router = express.Router();

router.use("*", verifyToken);

router.post("/", createMessage);
router.delete("/", delMessages);
router.get("/:conversationId", getMessages);

export default router;
