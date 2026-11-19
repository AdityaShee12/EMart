import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    reserved: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const Inventory =
  mongoose.model("Inventory", inventorySchema);