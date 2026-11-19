import { Router } from "express";
import { verifyJWT } from "../middlewires/auth/auth.middleware.js";
import { requireAdmin } from "../middlewires/requireAdmin.middlewire.js";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    updateProduct
} from "../controllers/product/product.controller.js";
import { upload } from "../middlewires/upload/multer.middleware.js";

const router = Router()

router.route("/postProducts").post(
    upload.fields([
        {
            name: "productImage",
            maxCount: 1,
        },
    ]),
    createProduct,
);

router.route("/getProducts").post(
    getAllProducts,
);

export default router