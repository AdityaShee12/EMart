import mongoose, { Schema } from "mongoose";

const shipmentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true
    },

    courierName: {
      type: String
    },

    trackingNumber: {
      type: String,
      unique: true,
      sparse: true
    },

    status: {
      type: String,
      enum: [
        "processing",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "returned"
      ],
      default: "processing"
    },

    shippedAt: {
      type: Date
    },

    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Shipment =
  mongoose.model("Shipment", shipmentSchema);