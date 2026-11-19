import { SellerRequest } from "../models/sellerRequest.model.js";
import { Buyer } from "../models/buyer.model.js";

// ==============================
// GET SELLER REQUESTS
// ==============================
const getSellerRequests = async (req, res) => {
    try {

        const { status } = req.query;

        const filter = {};

        if (
            status &&
            ["pending", "approved", "rejected"].includes(status)
        ) {
            filter.status = status;
        }

        const requests = await SellerRequest
            .find(filter)
            .populate(
                "userId",
                "fullName userName email avatar role"
            )
            .populate(
                "reviewedBy",
                "name email role"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {

        console.error(
            "Get Seller Requests Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==============================
// APPROVE SELLER REQUEST
// ==============================
const approveSellerRequest = async (req, res) => {
    try {

        const { requestId } = req.params;

        const adminId = req.user?._id;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }

        const sellerRequest =
            await SellerRequest.findById(requestId);

        if (!sellerRequest) {
            return res.status(404).json({
                success: false,
                message: "Seller request not found."
            });
        }

        if (sellerRequest.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "Seller request is already approved."
            });
        }

        if (sellerRequest.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Rejected request cannot be approved directly."
            });
        }

        const buyer = await Buyer.findById(
            sellerRequest.userId
        );

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: "Buyer not found."
            });
        }

        if (buyer.role === "seller") {
            return res.status(400).json({
                success: false,
                message: "User is already a seller."
            });
        }

        if (buyer.role === "admin") {
            return res.status(400).json({
                success: false,
                message: "Admin cannot become seller."
            });
        }


        // ==========================
        // UPDATE BUYER ROLE
        // ==========================

        buyer.role = "seller";

        await buyer.save();


        // ==========================
        // UPDATE SELLER REQUEST
        // ==========================

        sellerRequest.status = "approved";
        sellerRequest.reviewedBy = adminId;
        sellerRequest.reviewedAt = new Date();
        sellerRequest.rejectionReason = null;

        await sellerRequest.save();


        return res.status(200).json({
            success: true,
            message: "Seller request approved successfully.",
            request: sellerRequest
        });

    } catch (error) {

        console.error(
            "Approve Seller Request Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ==============================
// REJECT SELLER REQUEST
// ==============================
const rejectSellerRequest = async (req, res) => {
    try {

        const { requestId } = req.params;

        const { rejectionReason } = req.body;

        const adminId = req.user?._id;

        if (!adminId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }

        if (!rejectionReason?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required."
            });
        }

        const sellerRequest =
            await SellerRequest.findById(requestId);

        if (!sellerRequest) {
            return res.status(404).json({
                success: false,
                message: "Seller request not found."
            });
        }

        if (sellerRequest.status === "approved") {
            return res.status(400).json({
                success: false,
                message: "Approved request cannot be rejected."
            });
        }

        if (sellerRequest.status === "rejected") {
            return res.status(400).json({
                success: false,
                message: "Seller request is already rejected."
            });
        }


        sellerRequest.status = "rejected";

        sellerRequest.rejectionReason =
            rejectionReason.trim();

        sellerRequest.reviewedBy = adminId;

        sellerRequest.reviewedAt = new Date();

        await sellerRequest.save();


        return res.status(200).json({
            success: true,
            message: "Seller request rejected successfully.",
            request: sellerRequest
        });

    } catch (error) {

        console.error(
            "Reject Seller Request Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

export {
    getSellerRequests,
    approveSellerRequest,
    rejectSellerRequest
};
