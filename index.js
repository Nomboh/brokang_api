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
import { Server } from "socket.io";
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

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`user joined room ${room}`);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessage) => {
    const conversation = newMessage.conversation;
    if (!conversation.members) return console.log("No conversation found");

    conversation.members.forEach((member) => {
      if (member._id === newMessage.sender._id) return;

      socket.in(member._id).emit("message recieved", newMessage);
    });
  });

  socket.off("setup", () => {
    console.log("user disconnected");
    socket.leave(userData._id);
  });
});
