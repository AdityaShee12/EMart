import { Router } from "express";
import { getProducts } from "../controllers/product/product.controller.js";

const router = Router()

router.route("/getProducts").get(getProducts);

export default router