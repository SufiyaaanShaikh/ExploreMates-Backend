import express from "express";
import { verifyUser } from "../middleware/auth.middleware.js";
import {
  createDestination,
  deleteDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
} from "../controllers/destination.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/add",
  verifyUser,
  upload.single("destinationPhoto"),
  createDestination
);
router.get("/all", getAllDestinations);
router.get("/:destinationId", getDestinationById);
router.put("/:destinationId", verifyUser, updateDestination);
router.delete("/:destinationId", verifyUser, deleteDestination);

export const destinationRoutes = router;