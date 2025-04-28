import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import asyncWrapper from "./asyncWrapper.middleware.js";
import { User } from "../models/user.model.js";

export const verifyUser = asyncWrapper(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.header("authorization")?.split(" ")[1];
  if (!token) throw new ApiError(401, "Unauthorized");

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload._id);
    if (!user) throw new ApiError(401, "Invalid token");
    // if(!user.refreshToken) throw new ApiError(401, "Invalid token");
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid token");
  }
});
