import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  updateOrderStatus,
} from "../controllers/order/order.controller.js";
import { verifyJWT } from "../middlewires/auth/auth.middleware.js";

const router = Router();

router.post("/create", createOrder);
router.get("/getOrders", getMyOrders);


export default router;
