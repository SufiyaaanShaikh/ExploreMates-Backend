import asyncWrapper from "../middleware/asyncWrapper.middleware.js";
import { Trip } from "../models/trip.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";

// Get all trips of the current user
export const getUserTrips = asyncWrapper(async (req, res) => {
  const userId = req.user._id;

  const trips = await Trip.find({ user: userId }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiRes(200, trips, "Trips fetched successfully"));
});

// Get a single trip by ID
export const getTripById = asyncWrapper(async (req, res) => {
  const { tripId } = req.params;

  // Check if trip ID is valid
  if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid trip ID format");
  }

  // Find trip and populate user data - note the change here
  // We're not filtering by user ID so users can view each other's trips
  const trip = await Trip.findById(tripId).populate(
    "user",
    "name profilePhoto _id"
  );

  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  return res
    .status(200)
    .json(new ApiRes(200, trip, "Trip fetched successfully"));
});

export const getTripsForUser = asyncWrapper(async (req, res) => {
  const { userId } = req.params;

  // Check if user ID is valid
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const trips = await Trip.find({ user: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiRes(200, trips, "Trips fetched successfully"));
});

export const getAllTrips = asyncWrapper(async (req, res) => {
  const trips = await Trip.find({})
    .populate("user", "name profilePhoto _id") // Populate user details
    .sort({ createdAt: -1 });
  if (!trips) {
    throw new ApiError(404, "No trips found");
  }

  return res
    .status(200)
    .json(new ApiRes(200, trips, "All trips fetched successfully"));
});

// Create a new trip
export const createTrip = asyncWrapper(async (req, res) => {
  const {
    title,
    description,
    destination,
    duration,
    startDate,
    endDate,
    group,
  } = req.body;

  // Validate required fields
  if (!title || !destination || !duration) {
    throw new ApiError(400, "Title, destination and duration are required");
  }

  const userId = req.user._id;

  const newTrip = await Trip.create({
    title,
    description,
    destination,
    duration,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    group: group || "Solo",
    user: userId,
  });

  return res
    .status(201)
    .json(new ApiRes(201, newTrip, "Trip created successfully"));
});

// Update a trip
export const updateTrip = asyncWrapper(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  // Check if trip ID is valid
  if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid trip ID format");
  }

  const trip = await Trip.findOne({ _id: tripId, user: userId });

  if (!trip) {
    throw new ApiError(
      404,
      "Trip not found or you don't have permission to modify it"
    );
  }

  const updatedTrip = await Trip.findByIdAndUpdate(
    tripId,
    { ...req.body },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json(new ApiRes(200, updatedTrip, "Trip updated successfully"));
});

// Delete a trip
export const deleteTrip = asyncWrapper(async (req, res) => {
  const { tripId } = req.params;
  // const userId = req.user._id;

  // Check if trip ID is valid
  if (!tripId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new ApiError(400, "Invalid trip ID format");
  }

  const trip = await Trip.findOne({ _id: tripId });

  if (!trip) {
    throw new ApiError(
      404,
      "Trip not found or you don't have permission to delete it"
    );
  }

  await Trip.findByIdAndDelete(tripId);

  return res
    .status(200)
    .json(new ApiRes(200, null, "Trip deleted successfully"));
});
