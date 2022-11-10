import express from "express";
import {
  createMessage,
  getMessages,
  updateSeenMsg,
  updateSeenDel,
  createImageMessage,
  seenAllMessages,
} from "../controllers/message.js";
import { verifyToken } from "../utils/verify.js";

const router = express.Router();

router.use("*", verifyToken);

router.post("/", createMessage);
router.post("/image-send", createImageMessage);
router.put("/all-messages/:id", seenAllMessages);
router.put("/seen-message", updateSeenMsg);
router.put("/delivered-message", updateSeenDel);
router.get("/:id", getMessages);

export default router;
