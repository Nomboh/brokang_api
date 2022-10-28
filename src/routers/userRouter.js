import express from "express";
import {
  follow,
  getAllUsers,
  getFollowers,
  getFollowings,
  getUser,
  unfollow,
  updateMe,
} from "../controllers/userControler.js";
import { verifyToken, verifyUser } from "../utils/verify.js";

const router = express.Router();

router.put("/me", verifyUser, updateMe);
router.put("/follow/:id", verifyToken, follow);
router.put("/unfollow/:id", verifyToken, unfollow);
router.get("/", verifyToken, getAllUsers);
router.get("/followers", verifyToken, getFollowers);
router.get("/followings", verifyToken, getFollowings);
router.get("/:id", getUser);

export default router;
