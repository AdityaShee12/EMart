import { Router } from "express";
import { createSellerRequest, getSellerRequests } from "../controllers/sellerRequest.controller.js";

const router = Router();

router.route("/sellerRequest").post(createSellerRequest);

export default router;