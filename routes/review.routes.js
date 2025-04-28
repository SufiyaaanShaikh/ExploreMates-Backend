import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import { 
  createReview, 
  getMyReviews, 
  getUserReviews, 
  getAllReviews, 
  getReviewById, 
  deleteReview,
  updateReview
} from "../controllers/review.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyUser);

// Review routes
router.post("/", upload.single("reviewPhoto"), createReview);
router.get("/me", getMyReviews);
router.get("/user/:userId", getUserReviews);
router.get("/all", getAllReviews);
router.get("/:reviewId", getReviewById);
router.delete("/:reviewId", deleteReview);
router.put("/:reviewId", upload.single("reviewPhoto"), updateReview);

export const reviewRoutes = router;