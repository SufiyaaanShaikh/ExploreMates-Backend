import express from "express";
import {
  changePassword,
  deleteUser,
  followUser,
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// All routes are protected with auth middleware
// router.use(verifyUser);

// User routes with clear, RESTful design
router.get("/", getAllUsers);
router.get("/me",verifyUser, getCurrentUser);
router.get("/:id", getSingleUser);
router.put("/follow/:id",verifyUser, followUser);
router.put("/update-profile",verifyUser, upload.single("profile") , updateProfile);
// router.put("/update-password", updatePassword);
router.delete("/delete/:id",verifyUser, deleteUser);
router.put("/change-password",verifyUser, changePassword);
export const userRoutes = router;