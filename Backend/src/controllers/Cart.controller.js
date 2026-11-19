import mongoose from "mongoose";
import { Cart } from "../models/Cart/Cart.model.js"
import { Product } from "../models/product/product.model.js";
import { asyncHandler } from "../utiles/handlers/asyncHandler.js";
import { uploadOnCloudinary } from "../utiles/cloudinary.js";

const createCart = asyncHandler(async (req, res) => {

    const { userId, productDetails } = req.body;
    console.log("Data", req?.body);

    const { productId, productImages, price, quantity } = productDetails || {};

    // 1. Validate required fields
    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
            success: false,
            message: "Valid userId is required",
        });
    }

    if (!productId || !mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            success: false,
            message: "Valid productId is required",
        });
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        return res.status(400).json({
            success: false,
            message: "Quantity must be a positive integer",
        });
    }

    // 2. Find product in Product collection
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }

    // 3. Upload image to Cloudinary
    let productImageUrl = [];

    if (req.files?.productImage?.length) {
        const productImageLocalpath = req.files.productImage[0].path;

        const uploadedImage = await uploadOnCloudinary(
            productImageLocalpath
        );

        if (uploadedImage?.url) {
            productImageUrl.push(uploadedImage.url);
        }
    } else {
        // Use images already saved in Product document
        productImageUrl = product.images || [];
    }

    // 4. Find existing Cart document
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        // 5. Create new Cart if it doesn't exist
        cart = await Cart.create({
            userId,
            items: [
                {
                    productId: product._id,
                    image: productImageUrl,
                    quantity: Number(quantity),
                    priceAtAdded: product.price,
                },
            ],
        });
    } else {
        // 6. Check whether this product is already in the cart
        const existingItem = cart.items.find(
            (item) => item.productId.toString() === productId
        );

        if (existingItem) {
            // Increase quantity for an existing item
            existingItem.quantity += Number(quantity);
        } else {
            // Add new product to the existing items array
            cart.items.push({
                productId: product._id,
                image: productImageUrl,
                quantity: Number(quantity),
                priceAtAdded: product.price,
            });
        }

        // 7. Save changes to the existing Cart document
        await cart.save();
    }

    // 8. Populate Product details
    await cart.populate("items.productId");

    // 9. Send response
    return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        data: cart,
    });
});

const getCart = asyncHandler(async (req, res) => {

    const { userId } = req.query; console.log("Work", userId);


    // 1. Validate userId
    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
            success: false,
            message: "Valid userId is required",
        });
    }

    // 2. Find user's cart and fetch all cart products
    const cart = await Cart.findOne({ userId })
        .populate({
            path: "items.productId",
            select: "name description price images quantity status sellerId",
        });

    // 3. If cart doesn't exist
    if (!cart) {
        return res.status(200).json({
            success: true,
            message: "Cart is empty",
            data: {
                userId,
                items: [],
            },
        });
    }

    // 4. Return cart with all products
    return res.status(200).json({
        success: true,
        message: "Cart fetched successfully",
        data: cart,
    });
});

const removeCartItem = asyncHandler(async (req, res) => {

    const { userId } = req.body;
    const { productId } = req.params; console.log("Data", userId, productId);

    // Validate IDs
    if (
        !mongoose.isValidObjectId(userId) ||
        !mongoose.isValidObjectId(productId)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid userId or productId",
        });
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        return res.status(404).json({
            success: false,
            message: "Cart not found",
        });
    }

    // Find particular item
    const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
        return res.status(404).json({
            success: false,
            message: "Product not found in cart",
        });
    }

    // Remove particular item from items array
    cart.items.splice(itemIndex, 1);

    // Save updated cart
    await cart.save();

    return res.status(200).json({
        success: true,
        message: "Product removed from cart successfully",
        data: cart,
    });
});

const deleteCart = asyncHandler(async (req, res) => {

    const { userId } = req.body;
    console.log("Delete", userId);

    // Validate userId
    if (!userId || !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({
            success: false,
            message: "Valid userId is required",
        });
    }

    // Delete cart belonging to this user
    const result = await Cart.deleteMany({ userId });

    if (result.deletedCount === 0) {
        return res.status(404).json({
            success: false,
            message: "No cart found for this user",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Cart deleted successfully",
        deletedCount: result.deletedCount,
    });
});

export { createCart, getCart, removeCartItem, deleteCart };