import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema({
  
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  image: [
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

  priceAtAdded: {
    type: Number,
    required: true,
    min: 0,
  },
});

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model("Cart", cartSchema);