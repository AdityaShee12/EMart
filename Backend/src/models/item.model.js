import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export const OrderItem =
  mongoose.model("OrderItem", orderItemSchema);