import { Router } from "express";
// import { verifyJWT } from "../middlewires/auth.middlewire.js";
// import { isSuperAdmin } from "../middlewires/isSuperAdmin.middlewire.js";
// import { handleAdminRequest, pending_request } from "../controllers/admin.controller.js";
import { upload, uploadAdvertisementImages } from "../middlewires/upload/multer.middleware.js";
import {
    getSellerRequests,
    sellerRequestReply,
    getSellers,
    getProducts,
    updateProductStatus,
    uploadAdvertisement,
    getAdvertisement,
    getAllAdvertisement
} from "../controllers/sellerRequest.controller.js";

const router = Router()

router.route("/sellerRequest").get(getSellerRequests);
router.route("/sellerRequestReply").post(sellerRequestReply);
router.route("/sellers").get(getSellers);
router.route("/products").get(getProducts);
router.route("/product-status").patch(updateProductStatus);
router.route("/uploadAdvertisement")
    .post(uploadAdvertisementImages, uploadAdvertisement);
router.route("/getAdvertisement")
    .post(getAdvertisement);
router.route("/getAllAdvertisement")
    .post(getAllAdvertisement);

export default router