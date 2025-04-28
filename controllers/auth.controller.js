import asyncWrapper from "../middleware/asyncWrapper.middleware.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";

export const signUp = asyncWrapper(async (req, res, next) => {
  const { name, email, password, userType } = req.body;
  const user = new User({
    name,
    email,
    password,
    userType
  });
  const userExists = await User.findOne({ email });
  // console.log(user);
  if (userExists) throw new ApiError(400, "User already exists");
  

  const newUser = await user.save();
  res.status(201).json(
    new ApiRes(
      201,
      {
        newUser
      },
      true,
      "User created successfully"
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
    sameStie: "strict", // Prevent CSRF attacks
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
    .json(new ApiRes(200, null, "User logged out successfully"));
});
