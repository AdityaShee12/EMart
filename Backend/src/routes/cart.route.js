import { Router } from "express";
import { createCart, getCart, removeCartItem, deleteCart } from "../controllers/Cart.controller.js";
import { upload } from "../middlewires/upload/multer.middleware.js"

const router = Router()

router.route("/createCart").post(upload.fields([]), createCart);
router.route("/getCart").get(getCart);
router.route("/removeCartItem/:productId").post(removeCartItem);
router.route("/deleteCart").post(deleteCart);

export default router