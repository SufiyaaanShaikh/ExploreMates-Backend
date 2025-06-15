import asyncWrapper from "../middleware/asyncWrapper.middleware.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { generateOTP, sendOTPEmail } from "../utils/otpEmailService.js";

// Generate unique username
const generateUniqueUsername = async (name) => {
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .substring(0, 15);
  
  let username = baseUsername;
  let counter = 1;
  
  // Check if username exists and increment counter
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
    
    // Prevent infinite loop (max 1000 attempts)
    if (counter > 1000) {
      throw new ApiError(500, "Unable to generate unique username");
    }
  }
  
  return username;
};

// Step 1: Send OTP for email verification
export const sendSignupOTP = asyncWrapper(async (req, res, next) => {
  const { name, email, password, DOB, userType } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, "User with this email already exists");
  }

  // Generate OTP
  const otp = generateOTP();

  // Delete any existing OTP for this email
  await OTP.deleteMany({ email });

  // Store OTP with user data
  const otpDoc = new OTP({
    email,
    otp,
    userData: {
      name,
      email,
      password,
      DOB,
      userType: userType || "user",
    },
  });

  await otpDoc.save();

  // Send OTP email
  const emailResult = await sendOTPEmail(email, otp, name);
  
  if (!emailResult.success) {
    throw new ApiError(500, "Failed to send OTP email");
  }

  res.status(200).json(
    new ApiRes(
      200,
      { email },
      true,
      "OTP sent successfully to your email"
    )
  );
});

// Step 2: Verify OTP and create user
export const verifyOTPAndSignup = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;

  // Find OTP document
  const otpDoc = await OTP.findOne({ email });
  
  if (!otpDoc) {
    throw new ApiError(400, "OTP expired or invalid");
  }

  // Increment attempts
  otpDoc.attempts += 1;
  await otpDoc.save();

  // Check if max attempts exceeded
  if (otpDoc.attempts > 5) {
    await OTP.deleteOne({ email });
    throw new ApiError(400, "Maximum OTP attempts exceeded. Please request a new OTP");
  }

  // Verify OTP
  if (otpDoc.otp !== otp) {
    throw new ApiError(400, `Invalid OTP. ${6 - otpDoc.attempts} attempts remaining`);
  }

  // Generate unique username
  const username = await generateUniqueUsername(otpDoc.userData.name);

  // Create user
  const user = new User({
    ...otpDoc.userData,
    username,
  });

  const newUser = await user.save();

  // Delete OTP document
  await OTP.deleteOne({ email });

  res.status(201).json(
    new ApiRes(
      201,
      {
        user: {
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          userType: newUser.userType,
        }
      },
      true,
      "User created successfully"
    )
  );
});

// Resend OTP
export const resendOTP = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  // Find existing OTP document
  const otpDoc = await OTP.findOne({ email });
  
  if (!otpDoc) {
    throw new ApiError(400, "No pending signup found for this email");
  }

  // Generate new OTP
  const newOTP = generateOTP();
  
  // Update OTP document
  otpDoc.otp = newOTP;
  otpDoc.attempts = 0; // Reset attempts
  otpDoc.expiresAt = new Date(Date.now() + 2 * 60 * 1000); // Reset expiry to 2 minutes
  
  await otpDoc.save();

  // Send new OTP email
  const emailResult = await sendOTPEmail(email, newOTP, otpDoc.userData.name);
  
  if (!emailResult.success) {
    throw new ApiError(500, "Failed to send OTP email");
  }

  res.status(200).json(
    new ApiRes(
      200,
      { email },
      true,
      "New OTP sent successfully"
    )
  );
});

export const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) throw new ApiError(400, "Wrong Credentials");
  const accessToken = await user.generateAccessToken();

  user.accessToken = accessToken;
  await user.save();

  const cookieOption = {
    maxAge: 2 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Prevent XSS attacks
    sameStie: "strict", // Prevent CSRF attacks
    secure: process.env.NODE_ENV === "production",
  };
  if (process.env.NODE_ENV === "production") {
    cookieOption.domain = "example.com";
  }

  res.cookie("accessToken", accessToken, cookieOption);

  res.status(200).json(
    new ApiRes(
      200,
      {
        name: user.name,
        email: user.email,
        username: user.username,
        accessToken: accessToken,
        userType: user.userType,
      },
      true,
      "Logged in successfully"
    )
  );
});

export const logout = asyncWrapper(async (req, res, next) => {
  const cookieOption = {
    maxAge: 0,
    httpOnly: true, // Prevent XSS attacks
    sameSite: "strict", // Fixed typo: was "sameStie"
    secure: process.env.NODE_ENV === "production",
  };

  if (process.env.NODE_ENV === "production") {
    cookieOption.domain = "example.com";
  }

  res.cookie("accessToken", "", cookieOption);

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(400, "User not found");
  user.accessToken = "";
  await user.save();
  return res
    .status(200)
    .json(new ApiRes(200, null, true, "User logged out successfully"));
});