import mongoose from "mongoose";
import { Order } from "../../models/order/order.model.js"
import { Product } from "../../models/product/product.model.js";

const validStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const isValidAddress = (address) => {
  const requiredFields = [
    "name",
    "phone",
    "addressLine",
    "city",
    "state",
    "postalCode",
    "country",
  ];

  return (
    address &&
    requiredFields.every(
      (field) =>
        typeof address[field] === "string" &&
        address[field].trim().length > 0
    )
  );
};

// Create order
const createOrder = async (req, res) => {
  let reservedProductId = null;
  let reservedQuantity = 0;

  try {
    const {
      buyerId,
      productId,
      quantity = 1,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // 1. Check logged-in user
    if (!buyerId) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // 2. Validate product ID
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 3. Validate quantity
    const orderQuantity = Number(quantity);

    if (!Number.isSafeInteger(orderQuantity) || orderQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid product quantity",
      });
    }

    // 4. Validate payment method
    if (paymentMethod !== "cod") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Only COD is available.",
      });
    }

    // 5. Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName?.trim() ||
      !shippingAddress.phone?.trim() ||
      !shippingAddress.house?.trim() ||
      !shippingAddress.street?.trim() ||
      !shippingAddress.city?.trim() ||
      !shippingAddress.state?.trim() ||
      !shippingAddress.pinCode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete shipping address",
      });
    }

    // 6. Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit Indian mobile number",
      });
    }

    // 7. Validate PIN code
    if (!/^[1-9]\d{5}$/.test(shippingAddress.pinCode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit PIN code",
      });
    }

    // 8. Atomically reserve product stock
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        status: "approved",
        quantity: { $gte: orderQuantity },
      },
      {
        $inc: {
          quantity: -orderQuantity,
        },
      },
      {
        new: false,
      }
    ).lean();

    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product is unavailable or insufficient stock",
      });
    }

    reservedProductId = product._id;
    reservedQuantity = orderQuantity;

    // 9. Calculate price using database product price
    const unitPrice = Number(product.price);
    const deliveryCharge = 0;

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error("Invalid product price");
    }

    const totalAmount =
      unitPrice * orderQuantity + deliveryCharge;

    // 10. Create order
    const order = await Order.create({
      buyerId,
      productId: product._id,
      quantity: orderQuantity,
      unitPrice,
      deliveryCharge,
      totalAmount,

      shippingAddress: {
        name: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine: `${shippingAddress.house.trim()}, ${shippingAddress.street.trim()}`,
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.pinCode.trim(),
        country: "India",
      },

      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "pending",
    });

    // 11. Order created successfully
    reservedProductId = null;
    reservedQuantity = 0;

    return res.status(201).json({
      success: true,
      message: "COD order placed successfully",
      data: {
        order,
      },
    });
  } catch (error) {

    // 12. Restore stock if order creation fails
    if (reservedProductId && reservedQuantity > 0) {
      await Product.updateOne(
        {
          _id: reservedProductId,
        },
        {
          $inc: {
            quantity: reservedQuantity,
          },
        }
      ).catch((restoreError) => {
        console.error(
          "Stock restoration error:",
          restoreError
        );
      });
    }

    console.error("createOrder:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};

// Get logged-in buyer's orders
const getMyOrders = async (req, res) => {
  try {

    const { userId } = req.query;
    console.log("UserId", userId);

    // Validate userId
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    // Fetch user's orders
    const orders = await Order.find({
      buyerId: userId,
    })
      .populate("productId", "name images")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders,
      },
    });

  } catch (error) {

    console.error("getMyOrders:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getOrders = async (req, res) => {
  try {

    // Pagination
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Optional Filters
    const { status, paymentStatus } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Total Orders Count
    const totalOrders = await Order.countDocuments(filter);

    // Fetch All Orders
    const orders = await Order.find(filter)

      // Buyer Information
      .populate(
        "buyerId",
        "name email phone"
      )

      // Product + Seller Information
      .populate({
        path: "productId",
        select: "name images price sellerId",

        populate: {
          path: "sellerId",
          select: "name email"
        }
      })

      // Latest Orders First
      .sort({ createdAt: -1 })

      // Pagination
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: "All orders fetched successfully",

      data: {
        orders,

        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          limit
        }
      }
    });

  } catch (error) {

    console.error("getOrders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });

  }
};

// Get one order belonging to the logged-in buyer
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      buyerId: req.user._id,
    })
      .populate("productId", "name images price")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("getOrderById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

// Buyer cancels their own order
const cancelMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Only pending or confirmed orders can be cancelled.
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        buyerId: req.user._id,
        status: { $in: ["pending", "confirmed"] },
      },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found or can no longer be cancelled",
      });
    }

    // Return the reserved unit to stock.
    await Product.updateOne(
      { _id: order.productId },
      { $inc: { quantity: 1 } }
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    console.error("cancelMyOrder:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};

// Admin updates order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    console.log("ORder", req.body);

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned"
    ];

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        order: updatedOrder
      }
    });

  } catch (error) {
    console.error("Update Order Status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status"
    });
  }
};

export { createOrder, getOrders, getMyOrders, getOrderById, cancelMyOrder, updateOrderStatus };