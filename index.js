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

const app = express();
dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("Connected to MongoDB");
  } catch (err) {
    throw err;
  }
};

// on disconnected
mongoose.connection.on("disconnected", () => {
  console.log("Mongodb disconnected");
});

// middlewares
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ verify: (req, res, buf) => (req["rawBody"] = buf) }));
app.use(cookieParser());

//custom middleware
app.use("/", (req, res, next) => {
  res.send("Hello world");
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

const server = app.listen(process.env.PORT || 8800, () => {
  // on connected
  connect();
  console.log(`Server is running on port ${process.env.PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", socket => {
  console.log("New user connected");

  socket.on("setup", userData => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join room", room => {
    socket.join(room);
    console.log(`user joined room ${room}`);
  });

  socket.on("typing", room => socket.in(room).emit("typing"));
  socket.on("stop typing", room => socket.in(room).emit("stop typing"));

  socket.on("new message", newMessage => {
    const conversation = newMessage.conversation;
    if (!conversation.members) return console.log("No conversation found");

    conversation.members.forEach(member => {
      if (member._id === newMessage.sender._id) return;

      socket.in(member._id).emit("message recieved", newMessage);
    });
  });

  socket.off("setup", () => {
    console.log("user disconnected");
    socket.leave(userData._id);
  });
});
