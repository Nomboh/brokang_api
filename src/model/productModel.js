import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["new", "used", "semiused"],
    },

    state: {
      type: String,
      required: true,
      enum: ["sale", "reserved", "sold", "hidden"],
      default: "sale",
    },

    images: {
      type: Array,
      required: true,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    description: {
      type: String,
      required: true,
    },

    transactionMethod: {
      type: String,
      required: true,
      enum: ["card", "bank", "brokang"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: [String],

    shipping: [
      {
        deliveryFee: { type: String, required: true },
        shippingMethod: { type: String, required: true },
        burden: String,
        shippingOrigin: { type: String, default: "" },
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Product = mongoose.model("Product", productSchema);

export default Product;
