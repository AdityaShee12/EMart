import mongoose, { Schema } from "mongoose";
import { jsx } from "react/jsx-runtime";

const reviewSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Review =
  mongoose.model("Review", reviewSchema);