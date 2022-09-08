import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    expires: 600,
    type: Date,
    default: Date.now(),
  },
});

const Token = mongoose.model("Token", tokenSchema);
export default Token;
