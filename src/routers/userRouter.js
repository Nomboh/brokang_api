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
router.put("/follow/:id", verifyUser, follow);
router.put("/unfollow/:id", verifyUser, unfollow);
router.get("/", verifyToken, getAllUsers);
router.get("/followers", verifyUser, getFollowers);
router.get("/followings", verifyUser, getFollowings);
router.get("/:id", getUser);

export default router;
