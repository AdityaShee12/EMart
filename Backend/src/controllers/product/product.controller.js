import ApiError from "../../utiles/ApiError.js";
import asyncHandler from "../../utiles/asyncHandler.js";
import { uploadOnCloudinary } from "../../utiles/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { Do_slugify } from "../../utiles/slugify.util.js";
import ApiResponse from "../../utiles/ApiResponse.js";
import { Product } from "../../models/product/product.model.js";

const createProduct = asyncHandler(async (req, res) => {

  const {
    sellerId,
    name,
    price,
    description,
    quantity,
    status,
  } = req.body;

  // Seller authentication
  if (!sellerId) {
    throw new ApiError(
      401,
      "Seller authentication required"
    );
  }

  // Product name validation
  if (!name || !name.trim()) {
    throw new ApiError(
      400,
      "Product name is required"
    );
  }

  // Price validation
  const priceNum = Number(price);

  if (
    price === undefined ||
    price === "" ||
    !Number.isFinite(priceNum) ||
    priceNum <= 0
  ) {
    throw new ApiError(
      400,
      "Price must be a positive number"
    );
  }

  // Quantity validation
  const quantityNum = Number(quantity);

  if (
    quantity === undefined ||
    quantity === "" ||
    !Number.isInteger(quantityNum) ||
    quantityNum < 1
  ) {
    throw new ApiError(
      400,
      "Quantity must be a positive integer"
    );
  }

  // Description validation
  if (!description || !description.trim()) {
    throw new ApiError(
      400,
      "Description is required"
    );
  }

  if (description.trim().length > 500) {
    throw new ApiError(
      400,
      "Description must be less than 500 characters"
    );
  }

  // Status validation
  const productStatus = status || "pending";

  if (!["draft", "pending"].includes(productStatus)) {
    throw new ApiError(
      400,
      "Invalid product status"
    );
  }

  // Product images
  const imageFiles = req.files?.productImage || [];

  if (imageFiles.length === 0) {
    throw new ApiError(
      400,
      "Product image is required"
    );
  }

  // Upload images to Cloudinary
  const uploadedImages = [];

  for (const file of imageFiles) {
    const cloudImage = await uploadOnCloudinary(
      file.path
    );

    if (!cloudImage?.secure_url) {
      throw new ApiError(
        500,
        "Image upload to Cloudinary failed"
      );
    }

    uploadedImages.push(cloudImage.secure_url);
  }

  // Create product
  const newProduct = await Product.create({
    sellerId,
    name: name.trim(),
    description: description.trim(),
    price: priceNum,
    quantity: quantityNum,
    images: uploadedImages,
    status: productStatus,
  });

  if (!newProduct) {
    throw new ApiError(
      500,
      "Product creation failed"
    );
  }

  console.log(
    "Product created by seller:",
    sellerId
  );

  return res.status(201).json({
    success: true,
    message:
      productStatus === "draft"
        ? "Product saved as draft"
        : "Product submitted successfully",
    product: newProduct,
  });
});

const getAllProducts = asyncHandler(async (req, res) => {

  const { sellerId } = req.body;
  console.log("SellerId", sellerId);

  if (!sellerId) {
    return res.status(400).json(
      new ApiResponse(
        400,
        null,
        "Seller ID is required"
      )
    );
  }

  const products = await Product
    .find({ sellerId })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      products,
      "Products fetched successfully"
    )
  );
});

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, gender, type } = req.body;
  const productId = req.params.id;
  const user = req.user?._id;

  if (!productId) {
    throw new ApiError(400, "No product ID found");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // ✅ Slug and Name validation
  if (!name || name.trim() === "") {
    throw new ApiError(400, "Product name is required");
  }

  const slug = Do_slugify(name).toLowerCase();

  // ✅ Price validation
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    throw new ApiError(400, "Price must be a positive number");
  }

  // ✅ Description
  if (!description || description.length > 500) {
    throw new ApiError(400, "Description needed and must be ≤ 500 characters");
  }

  // ✅ Category
  if (!category || category.trim() === "") {
    throw new ApiError(400, "Category is required");
  }

  // ✅ Gender check
  const validGenders = ["men", "women", "kids", "unisex", "baby"];
  if (!gender || !validGenders.includes(gender.toLowerCase())) {
    throw new ApiError(400, "Valid gender is required (men/women/kids/unisex/baby)");
  }

  // ✅ Type check
  if (!type || type.trim() === "") {
    throw new ApiError(400, "Product type is required (e.g., 'T-shirt', 'Saree')");
  }

  // ✅ Handle image upload (optional)
  let updatedImage = product.image;
  const localImagePath = req.files?.image?.[0]?.path;

  if (localImagePath) {
    // ✅ Delete old image from Cloudinary
    await cloudinary.uploader.destroy(product.image.public_id);

    // ✅ Upload new image
    const cloudImage = await uploadOnCloudinary(localImagePath);

    if (!cloudImage?.secure_url || !cloudImage?.public_id) {
      throw new ApiError(500, "Image upload failed");
    }

    updatedImage = {
      url: cloudImage.secure_url,
      public_id: cloudImage.public_id,
    };
  }

  // ✅ Update product fields
  product.name = name.trim();
  product.slug = slug.trim();
  product.price = priceNum;
  product.description = description.trim();
  product.category = category.trim();
  product.gender = gender.toLowerCase().trim();
  product.type = type.trim();
  product.image = updatedImage;
  product.createdBy = user;

  const updatedProduct = await product.save();

  return res.status(200).json(
    new ApiResponse(200, updatedProduct, "Product updated successfully")
  );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  if (!productId) {
    throw new ApiError(400, "No product ID found");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found or already deleted");
  }

  // ✅ Delete image from Cloudinary
  await cloudinary.uploader.destroy(product.image.public_id);

  // ✅ Delete product from DB
  await product.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, product, "Product deleted successfully")
  );
});

const getProducts = asyncHandler(async (req, res) => {
  
  const products = await Product
    .find({ status: "approved" })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Approved products fetched successfully",
    data: {
      products,
    },
  });
});

export {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProducts
}