import { Router } from "express";
const router=Router()

router.get(
    "/admin/seller-requests",
    authenticate,
    isAdmin,
    getSellerRequests
);

router.get(
    "/admin/seller-requests/:requestId",
    authenticate,
    isAdmin,
    getSellerRequestById
);

router.get(
    "/admin/buyers/:userId",
    authenticate,
    isAdmin,
    getBuyerById
);

router.patch(
    "/admin/seller-requests/:requestId/approve",
    authenticate,
    isAdmin,
    approveSellerRequest
);

router.patch(
    "/admin/seller-requests/:requestId/reject",
    authenticate,
    isAdmin,
    rejectSellerRequest
);