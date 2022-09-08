import express from "express";
import {
  register,
  login,
  updatePassword,
  verifyEmail,
  resendToken,
  forgotPassword,
  resetPassword,
  logOut,
  isLogined,
} from "../controllers/authController.js";
import { verifyUser } from "../utils/verify.js";

const router = express.Router();

router.post("/register", register);

router.get("/logout", logOut);

router.get("/user/isLogin", isLogined);

router.post("/login", login);

router.post("/forgotPassword", forgotPassword);

router.post("/:userId", resendToken);

router.get("/resetpassword/:id/:token", verifyEmail);

router.post("/resetpassword/:id/:token", resetPassword);

router.put("/updatePassword/:id", verifyUser, updatePassword);

router.get("/verifyUser/:id", verifyUser, (req, res) =>
  res.send("You are verified")
);

export default router;
