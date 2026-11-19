import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },

    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    method: {
      type: String,
      enum: [
        "cod",
        "card",
        "upi",
        "netbanking",
        "wallet"
      ],
      required: true
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded"
      ],
      default: "pending"
    },

    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Payment =
  mongoose.model("Payment", paymentSchema);