import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./src/routers/authRouter.js";
import userRouter from "./src/routers/userRouter.js";
import catRouter from "./src/routers/catRouter.js";
import productRouter from "./src/routers/productRouter.js";
import reviewRouter from "./src/routers/reviewRouter.js";
import conversation from "./src/routers/conversation.js";
import stripeRouter from "./src/routers/stripeRouter.js";
import message from "./src/routers/message.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
dotenv.config();

// middlewares

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(helmet());
app.use(express.json({ verify: (req, res, buf) => (req["rawBody"] = buf) }));

app.use(compression());

app.use(morgan("dev"));

app.use((req, res, next) => {
  // console.log(req.cookies);
  next();
});

app.get("/", (req, res) => {
  res.send("<h1>Hello Brokang backend</h1>");
});

// routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/category", catRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/conversation", conversation);
app.use("/api/v1/message", message);
app.use("/api/v1/stripe", stripeRouter);

// error handler middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).json({
    message,
    status,
    success: false,
    stack: err.stack,
  });
});

mongoose.connect(process.env.MONGO_DB).then(() => {
  console.log("Mongo DB connected successfully");
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
