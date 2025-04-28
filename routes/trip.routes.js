import express from "express";
import {
  createTrip,
  deleteTrip,
  getAllTrips,
  getTripById,
  getTripsForUser,
  getUserTrips,
  updateTrip
} from "../controllers/trip.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected with auth middleware
router.use(verifyUser);

// Trip routes
router.get("/", getUserTrips);
router.get("/all", getAllTrips); // Move this BEFORE the /:tripId route
router.get("/user/:userId", getTripsForUser);
router.get("/:tripId", getTripById);
router.post("/", createTrip);
router.put("/:tripId", updateTrip);
router.delete("/:tripId", deleteTrip);

export const tripRoutes = router;