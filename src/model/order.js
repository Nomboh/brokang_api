import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    stripeCustomerId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: String,
    shipping: mongoose.Schema.Types.Mixed,
    deliveryStatus: String,
    image: String,
    brand: String,
    last4: String,
    sellerId: String,
    userId: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
