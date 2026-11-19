import { Buyer } from "../models/user/buyer.model.js";
import { SellerRequest } from "../models/sellerModel/sellerRequest.model.js";
import { Product } from "../models/product/product.model.js";
import { Admin } from "../models/user/admin.model.js";
import ApiError from "../utiles/ApiError.js";
import ApiResponse from "../utiles/ApiResponse.js";
import { asyncHandler } from "../utiles/handlers/asyncHandler.js";
import { SellerProfile } from "../models/user/seller.model.js";
import fs from "fs";
import { uploadOnCloudinary } from "../utiles/storage/cloudinary.js";
import { Advertisement } from "../models/advertisement.model.js";

const createSellerRequest = asyncHandler(async (req, res) => {
    try {
        const {
            id,
            storeName,
            storeDescription,
            storeLogo,
            phone,
            businessAddress,
            city,
            state,
            postalCode,
            country
        } = req.body;

        const userId = id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            });
        }


        if (
            !storeName?.trim() ||
            !storeDescription?.trim() ||
            !phone?.trim() ||
            !businessAddress?.trim() ||
            !city?.trim() ||
            !state?.trim() ||
            !postalCode?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are required."
            });
        }

        const buyer = await Buyer.findById(userId);

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: "Buyer not found."
            });
        }

        if (buyer.role === "seller") {
            return res.status(400).json({
                success: false,
                message: "You are already a seller."
            });
        }

        if (buyer.role === "admin") {
            return res.status(400).json({
                success: false,
                message: "Admin cannot submit seller request."
            });
        }

        const existingRequest = await SellerRequest.findOne({
            userId
        });

        if (existingRequest) {
            if (existingRequest.status === "pending") {
                return res.status(400).json({
                    success: false,
                    message: "Your seller request is already pending."
                });
            }

            if (existingRequest.status === "approved") {
                return res.status(400).json({
                    success: false,
                    message: "Your seller request is already approved."
                });
            }

            if (existingRequest.status === "rejected") {
                existingRequest.storeName = storeName.trim();
                existingRequest.storeDescription =
                    storeDescription.trim();
                existingRequest.storeLogo =
                    storeLogo?.trim() || null;
                existingRequest.phone = phone.trim();
                existingRequest.businessAddress =
                    businessAddress.trim();
                existingRequest.city = city.trim();
                existingRequest.state = state.trim();
                existingRequest.postalCode = postalCode.trim();
                existingRequest.country =
                    country?.trim() || "India";

                existingRequest.status = "pending";
                existingRequest.rejectionReason = null;
                existingRequest.reviewedBy = null;
                existingRequest.reviewedAt = null;

                await existingRequest.save();

                return res.status(200).json({
                    success: true,
                    message:
                        "Seller request resubmitted successfully.",
                    request: existingRequest
                });
            }
        }

        const sellerRequest = await SellerRequest.create({
            userId,

            storeName: storeName.trim(),

            storeDescription:
                storeDescription.trim(),

            storeLogo:
                storeLogo?.trim() || null,

            phone:
                phone.trim(),

            businessAddress:
                businessAddress.trim(),

            city:
                city.trim(),

            state:
                state.trim(),

            postalCode:
                postalCode.trim(),

            country:
                country?.trim() || "India"
        });

        return res.status(201).json({
            success: true,
            message: "Seller request submitted successfully.",
            request: sellerRequest
        });
    } catch (error) {
        console.error(
            "Create Seller Request Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
});

const getSellerRequests = asyncHandler(async (req, res) => {
    try {
        const sellerRequests = await SellerRequest
            .find({})
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Seller requests fetched successfully",
            data: {
                sellerRequests
            }
        });
    } catch (error) {
        console.error(
            "getAllSellerRequests error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch seller requests",
            error: error.message
        });
    }
});

const sellerRequestReply = asyncHandler(async (req, res) => {
    const {
        buyerId,
        requestReply,
        rejectionReason
    } = req.body;

    // =========================================
    // VALIDATION
    // =========================================

    if (!buyerId) {
        return res.status(400).json({
            success: false,
            message: "Buyer ID is required"
        });
    }


    if (
        requestReply !== 1 &&
        requestReply !== 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid request reply"
        });
    }


    // =========================================
    // FIND SELLER REQUEST
    // =========================================

    const sellerRequest =
        await SellerRequest.findOne({
            userId: buyerId
        });


    if (!sellerRequest) {
        return res.status(404).json({
            success: false,
            message: "Seller request not found"
        });
    }


    // =========================================
    // FIND BUYER
    // =========================================

    const buyer =
        await Buyer.findById(buyerId);


    if (!buyer) {
        return res.status(404).json({
            success: false,
            message: "Buyer not found"
        });
    }


    // =========================================
    // ALREADY PROCESSED CHECK
    // =========================================

    if (sellerRequest.status !== "pending") {

        return res.status(400).json({
            success: false,
            message: `Seller request is already ${sellerRequest.status}`
        });

    }


    // =========================================
    // APPROVE
    // requestReply === 1
    // =========================================

    if (requestReply === 1) {

        // -------------------------------------
        // UPDATE SELLER REQUEST
        // -------------------------------------

        sellerRequest.status = "approved";

        sellerRequest.rejectionReason = null;

        sellerRequest.reviewedAt = new Date();


        // যদি authentication middleware থেকে
        // admin id পাওয়া যায়
        if (req.user?._id) {
            sellerRequest.reviewedBy =
                req.user._id;
        }

        await sellerRequest.save();


        // -------------------------------------
        // UPDATE BUYER ROLE
        // -------------------------------------
        buyer.role = "seller";

        await buyer.save();


        // -------------------------------------
        // CREATE SELLER PROFILE
        // -------------------------------------
        let sellerProfile = await SellerProfile.findOne({
            userId: buyerId
        });


        if (!sellerProfile) {

            sellerProfile =
                await SellerProfile.create({

                    userId: buyerId,

                    storeName:
                        sellerRequest.storeName,

                    storeDescription:
                        sellerRequest.storeDescription,

                    storeLogo:
                        sellerRequest.storeLogo,

                    verificationStatus:
                        "approved"

                });

        } else {

            sellerProfile.storeName =
                sellerRequest.storeName;

            sellerProfile.storeDescription =
                sellerRequest.storeDescription;

            sellerProfile.storeLogo =
                sellerRequest.storeLogo;

            sellerProfile.verificationStatus =
                "approved";

            await sellerProfile.save();
        }

        // -------------------------------------
        // RESPONSE
        // -------------------------------------

        return res.status(200).json({
            success: true,
            message:
                "Seller request approved successfully",
            data: {
                sellerRequest,
                sellerProfile,
                buyer: {
                    _id: buyer._id,
                    name: buyer.name,
                    email: buyer.email,
                    role: buyer.role
                }
            }
        });
    }

    // =========================================
    // REJECT
    // requestReply === 0
    // =========================================
    if (requestReply === 0) {

        // Rejection reason required
        if (
            !rejectionReason ||
            !rejectionReason.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rejection reason is required"
            });
        }

        // -------------------------------------
        // UPDATE SELLER REQUEST
        // -------------------------------------
        sellerRequest.status = "rejected";

        sellerRequest.rejectionReason =
            rejectionReason.trim();

        sellerRequest.reviewedAt =
            new Date();

        if (req.user?._id) {
            sellerRequest.reviewedBy =
                req.user._id;
        }

        await sellerRequest.save();

        // -------------------------------------
        // RESPONSE
        // -------------------------------------
        return res.status(200).json({
            success: true,
            message:
                "Seller request rejected successfully",
            data: {
                sellerRequest
            }
        });
    }
}
);

const getSellers = asyncHandler(async (req, res) => {

    const sellers = await SellerRequest
        .find({})
        .populate("userId", "name email avatar role")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Sellers fetched successfully",
        data: {
            sellers
        }
    });
});

const getProducts = asyncHandler(async (req, res) => {

    const products = await Product
        .find({})
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: {
            products
        }
    });
});

const updateProductStatus = asyncHandler(async (req, res) => {
    const { productId, status, rejectionReason } = req.body;

    if (!productId) {
        return res.status(400).json({
            success: false,
            message: "Product ID is required"
        });
    }
    console.log("Status", status);

    if (status !== 1 && status !== 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid product status"
        });
    }

    if (status === 0 && !rejectionReason?.trim()) {
        return res.status(400).json({
            success: false,
            message: "Rejection reason is required"
        });
    }

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    // 1 = approved, 0 = rejected
    product.status = status === 1 ? "approved" : "rejected";

    if (status === 0) {
        product.rejectionReason = rejectionReason.trim();
    } else {
        product.rejectionReason = null;
    }

    await product.save();

    return res.status(200).json({
        success: true,
        message:
            status === 1
                ? "Product approved successfully"
                : "Product rejected successfully",
        data: {
            product
        }
    });
});

const uploadAdvertisement = asyncHandler(async (req, res) => {
    try {
        console.log("works");

        const {
            superAdminId,
            title,
            subtitle,
            description,
            buttonText,
            buttonLink,
            offerText,
            position,
            status,
            startDate,
            endDate,
            priority
        } = req.body;

        // ==============================
        // 1. Required field validation
        // ==============================

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Advertisement title is required"
            });
        }

        if (!startDate) {
            return res.status(400).json({
                success: false,
                message: "Start date is required"
            });
        }

        if (!endDate) {
            return res.status(400).json({
                success: false,
                message: "End date is required"
            });
        }

        // ==============================
        // 2. Get uploaded files
        // ==============================

        const images = req.files?.images || [];
        const mobileImageFile = req.files?.mobileImage?.[0] || null;

        // Advertisement main images
        if (images.length < 1 || images.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Advertisement must have between 1 and 5 images"
            });
        }

        // ==============================
        // 3. Date validation
        // ==============================

        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        if (isNaN(parsedStartDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid start date"
            });
        }

        if (isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid end date"
            });
        }

        if (parsedEndDate < parsedStartDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be greater than start date"
            });
        }

        // ==============================
        // 4. Position validation
        // ==============================

        const allowedPositions = [
            "homepage",
            "category",
            "products"
        ];

        const advertisementPosition =
            position || "homepage";

        if (!allowedPositions.includes(advertisementPosition)) {
            return res.status(400).json({
                success: false,
                message: "Invalid advertisement position"
            });
        }

        // ==============================
        // 5. Status validation
        // ==============================

        const allowedStatuses = [
            "draft",
            "active",
            "inactive",
            "expired"
        ];

        const advertisementStatus =
            status || "draft";

        if (!allowedStatuses.includes(advertisementStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid advertisement status"
            });
        }

        // ==============================
        // 6. Priority
        // ==============================

        const advertisementPriority =
            priority === undefined ||
                priority === ""
                ? 0
                : Number(priority);

        if (
            Number.isNaN(advertisementPriority) ||
            advertisementPriority < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Priority must be a valid number"
            });
        }

        // ==============================
        // 7. Upload main images
        // ==============================

        const imageUrls = [];

        for (const file of images) {
            const result = await uploadOnCloudinary(
                file.path,
                "e-mart/advertisements"
            );

            imageUrls.push(result.secure_url);

            // Delete temporary file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        // ==============================
        // 8. Upload mobile image
        // ==============================

        let mobileImage = null;

        if (mobileImageFile) {
            const result = await uploadOnCloudinary(
                mobileImageFile.path,
                "e-mart/advertisements/mobile"
            );

            mobileImage = result.secure_url;

            // Delete temporary file
            if (fs.existsSync(mobileImageFile.path)) {
                fs.unlinkSync(mobileImageFile.path);
            }
        }

        // ==============================
        // 9. Create Advertisement
        // ==============================

        const advertisement = await Advertisement.create({
            title: title.trim(),

            subtitle:
                subtitle?.trim() || undefined,

            description:
                description?.trim() || undefined,

            images: imageUrls,

            mobileImage,

            buttonText:
                buttonText?.trim() || "Shop Now",

            buttonLink:
                buttonLink?.trim() || "/products",

            offerText:
                offerText?.trim() || null,

            position: advertisementPosition,

            status: advertisementStatus,

            startDate: parsedStartDate,

            endDate: parsedEndDate,

            priority: advertisementPriority,

            createdBy: superAdminId,
        });

        // ==============================
        // 10. Response
        // ==============================

        return res.status(201).json({
            success: true,
            message: "Advertisement uploaded successfully",
            data: {
                advertisement
            }
        });

    } catch (error) {
        console.error(
            "uploadAdvertisement error:",
            error
        );

        // ==============================
        // Delete temporary files
        // if something fails
        // ==============================

        if (req.files) {
            const allFiles = [
                ...(req.files.images || []),
                ...(req.files.mobileImage || [])
            ];

            for (const file of allFiles) {
                if (
                    file.path &&
                    fs.existsSync(file.path)
                ) {
                    fs.unlinkSync(file.path);
                }
            }
        }

        return res.status(500).json({
            success: false,
            message: "Failed to upload advertisement",
            error: error.message
        });
    }
});

const getAdvertisement = asyncHandler(async (req, res) => {

    try {
        const {
            superAdminId
        } = req.body;

        const advertisements = await Advertisement
            .find({
                createdBy: superAdminId
            })
            .populate(
                "createdBy",
                "name email role avatar"
            )
            .sort({ createdAt: -1 });
        console.log("Advertisement1", advertisements);

        return res.status(200).json({
            success: true,
            message: "Advertisements fetched successfully",
            data: {
                advertisements
            }
        });

    } catch (error) {
        console.error(
            "getAdvertisement error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch advertisements",
            error: error.message
        });
    }
});

const getAllAdvertisement = asyncHandler(async (req, res) => {
    try {
        const advertisements = await Advertisement
            .find({})
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Advertisements fetched successfully",
            data: {
                advertisements
            }
        });

    } catch (error) {
        console.error(
            "getAdvertisement error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch advertisements",
            error: error.message
        });
    }
});

export { createSellerRequest, getSellerRequests, sellerRequestReply, getSellers, getProducts, updateProductStatus, uploadAdvertisement, getAdvertisement, getAllAdvertisement };