import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    images: [
      {
        type: String
      }
    ],

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected"
      ],
      default: "draft",
      required: true
    },

    rejectionReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Product =
  mongoose.model("Product", productSchema);