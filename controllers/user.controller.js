import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { deleteFromCloudinary, uploadonCloudinary } from "../cdn/cloudinary.js";
import asyncWrapper from "../middleware/asyncWrapper.middleware.js";
import { User } from "../models/user.model.js";
import { Trip } from "../models/trip.model.js";
import { Review } from "../models/review.model.js";

export const getAllUsers = asyncWrapper(async (req, res) => {
  const search = req.query.search || "";
  const currentUserId = req.user?._id; // Get current user ID if authenticated

  // Create search query
  let searchQuery = {
    userType: { $ne: "admin" }, // Exclude admins
  };

  if (search) {
    searchQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  // Exclude current user if logged in
  if (currentUserId) {
    searchQuery._id = { $ne: currentUserId };
  }

  // Fetch users
  const users = await User.find(searchQuery)
    .select("_id name email profilePhoto address bio followers")
    .limit(50)
    .lean();

  return res
    .status(200)
    .json(new ApiRes(200, users || [], "Users fetched successfully"));
});

export const getCurrentUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("following", "_id name userType profilePhoto following followers")
    .populate(
      "followers",
      "_id name userType profilePhoto following followers"
    );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json(user);
});

export const getSingleUser = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "_id name profilePhoto followers following")
    .populate("following", "_id name profilePhoto followers following");

  if (!user) throw new ApiError(404, "User not found");
  res.json(user);
});

export const followUser = asyncWrapper(async (req, res) => {
  if (req.user._id == req.params.id) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const user = await User.findById(req.user._id);
  const targetUser = await User.findById(req.params.id);

  if (!user || !targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Check if already following by converting ObjectIds to strings for comparison
  const isFollowing = user.following.some(
    (id) => id.toString() === targetUser._id.toString()
  );

  if (isFollowing) {
    // Unfollow: Remove IDs from both users
    user.following = user.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== user._id.toString()
    );

    await user.save();
    await targetUser.save();
    return res.json({
      message: "Unfollowed successfully",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } else {
    // Follow: Add IDs to both users
    user.following.push(targetUser._id);
    targetUser.followers.push(user._id);

    await user.save();
    await targetUser.save();
    return res.json({
      message: "Followed successfully",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  }
});

export const updateProfile = asyncWrapper(async (req, res) => {
  const userId = req.user._id; // From authenticated user
  const { name, email, phone, age, address, bio } = req.body;

  // Find the user first to get current profile photo ID
  const currentUser = await User.findById(userId);

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  // Build update query with text fields
  const updateQuery = { name, email, phone, age, address, bio };

  // Handle file upload if a new profile photo was uploaded
  if (req.file) {
    // Upload new image to Cloudinary
    const uploadResult = await uploadonCloudinary(  req.file.buffer,
          req.file.mimetype);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload profile photo");
    }

    // Add new image details to update query
    updateQuery.profilePhoto = uploadResult.secure_url;
    updateQuery.profilePhotoID = uploadResult.public_id;

    // Delete the old profile photo from Cloudinary if it exists
    if (currentUser.profilePhotoID) {
      await deleteFromCloudinary(currentUser.profilePhotoID);
    }
  }

  // Update user with new data
  const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
    new: true, // Return updated document
    runValidators: true, // Run model validations
  }).select("-password");

  return res.status(200).json(
    new ApiRes(
      200,
      {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        age: updatedUser.age,
        address: updatedUser.address,
        bio: updatedUser.bio,
        profilePhoto: updatedUser.profilePhoto,
      },
      "Profile updated successfully"
    )
  );
});

export const deleteUser = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Only allow an admin or the user themselves to delete the account
  if (
    req.user._id.toString() !== id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You are not authorized to delete this user");
  }

  // Delete all trips created by the user
  await Trip.deleteMany({ user: id });
  // Delete all Reviews created by the user
  await Review.deleteMany({ user: id });
  if (user.profilePhotoID) {
    await deleteFromCloudinary(user.profilePhotoID);
  }
  // Delete the user
  await User.findByIdAndDelete(id);

  return res
    .status(200)
    .json(
      new ApiRes(
        200,
        null,
        true,
        "User and associated trips deleted successfully"
      )
    );
});

// Update this function in user.controller.js
export const changePassword = asyncWrapper(async (req, res) => {
  const { email, newPassword } = req.body;

  // Validate that the email matches the logged in user
  if (email !== req.user.email) {
    throw new ApiError(403, "Email doesn't match with logged in user");
  }

  // Find the user
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update password directly - no current password check
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiRes(200, null, true, "Password changed successfully"));
});
