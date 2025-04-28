import asyncWrapper from "../middleware/asyncWrapper.middleware.js";
import { Review } from "../models/review.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { uploadonCloudinary, deleteFromCloudinary } from "../cdn/cloudinary.js";

// Create a new review
export const createReview = asyncWrapper(async (req, res) => {
  const {
    title,
    reviewDes,
    locationVisited,
    rating,
    duration,
    startDate,
    endDate,
  } = req.body;

  // Get the user ID from authenticated user
  const user = req.user._id;

  if (!title || !locationVisited || !rating || !duration) {
    throw new ApiError(
      400,
      "Title, location, rating and duration are required"
    );
  }

  const reviewData = {
    title,
    reviewDes,
    locationVisited,
    rating: Number(rating),
    duration: Number(duration),
    user,
    startDate,
    endDate,
  };

  // Handle file upload if a photo was provided
  if (req.file) {
    // Upload image to Cloudinary
    const uploadResult = await uploadonCloudinary(req.file.path);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload review photo");
    }

    // Add image details to review data
    reviewData.reviewPhoto = uploadResult.secure_url;
    reviewData.reviewPhotoID = uploadResult.public_id;
  } else {
    // Set default values if no photo is provided
    reviewData.reviewPhoto = "";
    reviewData.reviewPhotoID = "";
  }

  const review = await Review.create(reviewData);

  return res
    .status(201)
    .json(new ApiRes(200, review, "Review created successfully"));
});

// Get all reviews for the logged-in user
export const getMyReviews = asyncWrapper(async (req, res) => {
  const userId = req.user._id;

  const reviews = await Review.find({ user: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiRes(200, reviews, "User reviews fetched successfully"));
});

// Get all reviews by a specific user
export const getUserReviews = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const reviews = await Review.find({ user: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiRes(200, reviews, "User reviews fetched successfully"));
});

// Get all reviews (for public display)
export const getAllReviews = asyncWrapper(async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name profilePhoto") // Populate user data if needed
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiRes(200, reviews, "All reviews fetched successfully"));
});

// Get a single review by ID
export const getReviewById = asyncWrapper(async (req, res) => {
  const { reviewId } = req.params;

  if (!reviewId) {
    throw new ApiError(400, "Review ID is required");
  }

  const review = await Review.findById(reviewId).populate(
    "user",
    "name profilePhoto"
  );

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return res
    .status(200)
    .json(new ApiRes(200, review, "Review fetched successfully"));
});

// Delete a review (with access control)
export const deleteReview = asyncWrapper(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!reviewId) {
    throw new ApiError(400, "Review ID is required");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if the user is the owner of the review
  if (review.user.toString() !== userId.toString()  && req.user.userType !== "admin") {
    throw new ApiError(403, "You are not authorized to delete this review");
  }

  // Delete the review photo from Cloudinary if it exists
  if (review.reviewPhotoID) {
    await deleteFromCloudinary(review.reviewPhotoID);
  }

  await Review.findByIdAndDelete(reviewId);

  return res
    .status(200)
    .json(new ApiRes(200, {}, "Review deleted successfully"));
});

// Update a review
export const updateReview = asyncWrapper(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const {
    title,
    reviewDes,
    locationVisited,
    rating,
    duration,
    startDate,
    endDate,
  } = req.body;

  if (!reviewId) {
    throw new ApiError(400, "Review ID is required");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if the user is the owner of the review
  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this review");
  }

  const updateData = {
    title: title || review.title,
    reviewDes: reviewDes || review.reviewDes,
    locationVisited: locationVisited || review.locationVisited,
    rating: rating ? Number(rating) : review.rating,
    duration: duration ? Number(duration) : review.duration,
    startDate: startDate || review.startDate,
    endDate: endDate || review.endDate,
  };

  // Handle file upload if a new photo was provided
  if (req.file) {
    // Delete old photo from Cloudinary if it exists
    if (review.reviewPhotoID) {
      await deleteFromCloudinary(review.reviewPhotoID);
    }

    // Upload new image to Cloudinary
    const uploadResult = await uploadonCloudinary(req.file.path);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload review photo");
    }

    // Add new image details to update data
    updateData.reviewPhoto = uploadResult.secure_url;
    updateData.reviewPhotoID = uploadResult.public_id;
  }

  const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
    new: true,
  });

  return res
    .status(200)
    .json(new ApiRes(200, updatedReview, "Review updated successfully"));
});
