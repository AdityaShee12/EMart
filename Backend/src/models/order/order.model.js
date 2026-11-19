import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // কতগুলো product order হয়েছে
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    // একটি product-এর দাম
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // Delivery charge
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    // মোট amount = unitPrice * quantity + deliveryCharge
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "debit", "credit"],
      required: true,
      default: "cod",
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Order status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },

    // Shipping address
    shippingAddress: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
        default: "India",
      },
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
