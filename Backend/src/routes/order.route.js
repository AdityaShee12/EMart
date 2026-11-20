import { Router } from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
} from "../controllers/order/order.controller.js";
import { verifyJWT } from "../middlewires/auth/auth.middleware.js";

const router = Router();

router.post("/create", createOrder);
router.get("/getOrders", getOrders);
router.patch("/updateOrders/:orderId", updateOrderStatus);

export default router;
