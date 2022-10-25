import User from "../model/userModel.js";
import { catchAsync } from "../utils/async.js";
import { createError } from "../utils/error.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Token from "../model/tokenModel.js";
import sendEmail from "../utils/email.js";
import dotenv from "dotenv";

dotenv.config();

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, birthDate, phone, photo, isAdmin } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) {
        return next(err);
      }
      const user = await User.create({
        name,
        email,
        password: hash,
        birthDate,
        phone,
        photo,
        isAdmin,
      });

      const token = await Token.create({
        token: crypto.randomBytes(32).toString("hex"),
        userId: user._id,
      });

      const url = `${process.env.BASE_URL}/auth/${user._id}/verify/${token.token}`;
      await sendEmail(
        user.email,
        "Please verify your email (token expires in 1 hour)",
        url
      );
      res.status(201).json({
        status: "success",
        message: "an email has been sent to you to verify your account",
      });
    });
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(createError("User or Password is incorrect", 400));
  }
  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    return next(createError("User or Password is incorrect", 400));
  }

  jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "2016h" },
    (err, token) => {
      if (err) {
        return next(err);
      }

      /* if (user.isVerified === false) {
        return next(createError("Please verify your account", 400));
      } */

      const { password, ...others } = user._doc;

      res
        .cookie("token", token, {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          sameSite: "none",
        })
        .status(200)
        .json({
          status: "success",
          data: others,
        });
    }
  );
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const { currentPassword, newPassword } = req.body;

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(createError("Current Password is incorrect", 400));
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newPassword, salt, async (err, hash) => {
        if (err) {
          return next(err);
        }
        user.password = hash;
        await user.save({ new: true });
        jwt.sign(
          { id: user._id, isAdmin: user.isAdmin },
          process.env.JWT_SECRET,
          { expiresIn: "2016h" },
          (err, token) => {
            if (err) {
              return next(err);
            }
            res
              .cookie("token", token, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                sameSite: "none",
              })
              .status(200)
              .json({ status: "success" });
          }
        );
      });
    });
  }
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const token = await Token.findOne({
    token: req.params.token,
  });
  if (!token) {
    return next(createError("Invalid Token", 400));
  }
  const user = await User.findById(token.userId);
  if (!user) {
    return next(createError("Invalid Token", 400));
  }

  if (token.createdAt.getTime() < Date.now() - 1000 * 60 * 10) {
    return next(createError("Token Expired", 400));
  }
  user.isVerified = true;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Email Verified successfully",
    isVerified: user.isVerified,
  });
});

export const resendToken = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return next(createError("User not found", 400));
  }
  const token = await Token.create({
    token: crypto.randomBytes(32).toString("hex"),
    userId: user._id,
  });
  const url = `${process.env.BASE_URL}/auth/${user._id}/verify/${token.token}`;
  await sendEmail(user.email, "Please verify your email", url);
  res.status(201).json({
    status: "success",
    message: "an email has been sent to you to verify your account",
  });
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(createError("User not found", 400));
  }

  const existingToken = await Token.findOne({ userId: user._id });
  if (existingToken?.createdAt?.getTime() < Date.now() - 600000) {
    await existingToken.remove();
  }

  if (existingToken) {
    return next(
      createError("Token already sent, try again after 10 minutes", 400)
    );
  }
  const token = await Token.create({
    token: crypto.randomBytes(32).toString("hex"),
    userId: user._id,
  });
  const url = `${process.env.BASE_URL}/auth/reset/${token.token}`;
  await sendEmail(
    user.email,
    "Please reset your password(expires in 10 min)",
    url,
    user._id,
    token.token
  );
  res.status(201).json({
    status: "success",
    message: "an email has been sent to you to reset your password",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const token = await Token.findOne({
    token: req.params.token,
  });
  if (!token) {
    return next(createError("Invalid Token", 400));
  }
  const user = await User.findById(token.userId);
  if (!user) {
    return next(createError("Invalid Token", 400));
  }

  if (token.createdAt.getTime() < Date.now() - 600000) {
    await token.remove();
    return next(createError("Token expired", 400));
  }

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(req.body.password, salt, async (err, hash) => {
      if (err) {
        return next(
          createError("we could not create a new password. try again", 400)
        );
      }
      user.password = hash;
      await user.save();
      await token?.remove();
      res
        .status(200)
        .json({ status: "success", message: "Password changed successfully" });
    });
  });
});

export const isLogined = (req, res) => {
  if (req.cookies.token) {
    res.status(200).send({ isLogin: true });
  } else {
    res.status(200).send({ isLogin: false });
  }
};

export const logOut = (req, res) => {
  res.clearCookie("token").status(204).json({ status: "success" });
};
