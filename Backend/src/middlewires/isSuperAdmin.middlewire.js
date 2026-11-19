import asyncHandler from "../utiles/asyncHandler.js";
import ApiError from "../utiles/ApiError.js";

export const isSuperAdmin = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // 🔐 1. Check if user is attached from verifyJWT
  if (!user) {
    throw new ApiError(401, "Unauthorized: User information is missing. Token might be invalid or expired.");
  }

  // 🔐 2. Check if user has a role
  if (!user.role) {
    throw new ApiError(403, "Forbidden: No role assigned to the user.");
  }

  // 🔐 3. Check if user is superadmin
  if (user.role !== "superadmin") {
    const message = `Forbidden: This route is restricted to superadmins only. Your current role is '${user.role}'.`;
    throw new ApiError(403, message);
  }

  // ✅ All checks passed
  next();
});