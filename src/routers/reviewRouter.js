import express from "express";
import {
  createReview,
  getAllReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/", getAllReviews);

export default router;
