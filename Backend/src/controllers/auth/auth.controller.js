import { asyncHandler } from "../../utiles/handlers/asyncHandler.js";
import { ApiResponse } from "../../utiles/response/ApiResponse.js";
import { ApiError } from "../../utiles/response/ApiError.js";
import { Buyer } from "../../models/user/buyer.model.js";
import { uploadOnCloudinary } from "../../utiles/storage/cloudinary.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { Admin } from "../../models/user/admin.model.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Required fields validation
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(
      400,
      "Name, email and password are required"
    );
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Password must contain uppercase, lowercase, number and special character"
    );
  }

  // Check existing user
  const existedUser = await Buyer.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this email already exists"
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Avatar upload
  let avatarUrl = "";

  if (req.files?.avatar?.[0]?.path) {
    const avatarLocalPath = req.files.avatar[0].path;

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    avatarUrl = avatar?.url || "";
  }

  // Create buyer
  const user = await Buyer.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: role || "buyer",
    avatar: avatarUrl,
  });

  // Remove password from response
  const createdUser = await Buyer.findById(user._id).select(
    "-password"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the user"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Required fields
  if (!email?.trim() || !password) {
    throw new ApiError(
      400,
      "Email and password are required"
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // =====================================================
  // 1. First check Admin / SuperAdmin
  // =====================================================

  const admin = await Admin.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (admin) {

    // Check account status
    if (admin.status !== "active") {
      throw new ApiError(
        403,
        `Admin account is ${admin.status}`
      );
    }
    console.log("Pass", password,
      admin.password);

    // Check password
    const isPasswordValid = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isPasswordValid) {
      throw new ApiError(
        401,
        "Invalid email or password"
      );
    }

    // Update login information
    admin.lastLoginAt = new Date();
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;

    await admin.save();

    // Remove sensitive information
    const loggedInAdmin = await Admin.findById(
      admin._id
    ).select("-password -twoFactorSecret");

    if (!loggedInAdmin) {
      throw new ApiError(
        500,
        "Something went wrong while logging in"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loggedInAdmin,
        },
        "Login successful"
      )
    );
  }

  // =====================================================
  // 2. If Admin not found -> Check Buyer
  // =====================================================

  const buyer = await Buyer.findOne({
    email: normalizedEmail,
  });

  if (!buyer) {
    throw new ApiError(
      404,
      "Account does not exist"
    );
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(
    password,
    buyer.password
  );

  if (!isPasswordValid) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  // Remove password
  const loggedInBuyer = await Buyer.findById(
    buyer._id
  ).select("-password");

  if (!loggedInBuyer) {
    throw new ApiError(
      500,
      "Something went wrong while logging in"
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: loggedInBuyer,
        role: loggedInBuyer.role,
      },
      "Login successful"
    )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  console.log("UID", _id);

  await User.findByIdAndUpdate(
    _id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const setPassword = asyncHandler(async (req, res) => {
  const { password, email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  user.password = password; // plain password
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: user._id,
        fullName: user.fullName,
        avatar: user.avatar,
        about: user.about,
      },
      "Password was changed successfully",
    ),
  );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken;

  if (incomingRefreshToken) { throw new ApiError(401, "Refresh token expired"); }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token expired or already used");
    }

    // Generate NEW tokens
    const { accessToken, refreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, { accessToken }, "Access token refreshed")
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  setPassword,
};