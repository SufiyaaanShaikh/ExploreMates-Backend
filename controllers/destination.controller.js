import asyncWrapper from "../middleware/asyncWrapper.middleware.js";
import { Destination } from "../models/destination.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { uploadonCloudinary, deleteFromCloudinary } from "../cdn/cloudinary.js";

// Create a new destination
export const createDestination = asyncWrapper(async (req, res) => {
  const {
    name,
    description,
    location,
    bestTimeToVisit,
    travelDuration
  } = req.body;

  // Validate required fields
  if (!name || !description || !location || !bestTimeToVisit || !travelDuration) {
    throw new ApiError(
      400,
      "Name, description, location, best time to visit and travel duration are required"
    );
  }

  const destinationData = {
    name,
    description,
    location,
    bestTimeToVisit,
    travelDuration
  };

  // Handle file upload if a photo was provided
  if (req.file) {
    // Upload image to Cloudinary
    const uploadResult = await uploadonCloudinary(req.file.path);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload destination photo");
    }

    // Add image details to destination data
    destinationData.DestinationPhoto = uploadResult.secure_url;
    destinationData.DestinationPhotoID = uploadResult.public_id;
  } else {
    // Set default values if no photo is provided
    destinationData.DestinationPhoto = "";
    destinationData.DestinationPhotoID = "";
  }

  const destination = await Destination.create(destinationData);

  return res
    .status(201)
    .json(new ApiRes(201, destination, "Destination created successfully"));
});

// Get all destinations
export const getAllDestinations = asyncWrapper(async (req, res) => {
  const destinations = await Destination.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiRes(200, destinations, "All destinations fetched successfully"));
});

// Get a destination by ID
export const getDestinationById = asyncWrapper(async (req, res) => {
  const { destinationId } = req.params;

  if (!destinationId) {
    throw new ApiError(400, "Destination ID is required");
  }

  const destination = await Destination.findById(destinationId);

  if (!destination) {
    throw new ApiError(404, "Destination not found");
  }

  return res
    .status(200)
    .json(new ApiRes(200, destination, "Destination fetched successfully"));
});

// Update a destination
export const updateDestination = asyncWrapper(async (req, res) => {
  const { destinationId } = req.params;
  const {
    name,
    description,
    location,
    bestTimeToVisit,
    travelDuration
  } = req.body;

  if (!destinationId) {
    throw new ApiError(400, "Destination ID is required");
  }

  const destination = await Destination.findById(destinationId);

  if (!destination) {
    throw new ApiError(404, "Destination not found");
  }

  const updateData = {
    name: name || destination.name,
    description: description || destination.description,
    location: location || destination.location,
    bestTimeToVisit: bestTimeToVisit || destination.bestTimeToVisit,
    travelDuration: travelDuration || destination.travelDuration
  };

  // Handle file upload if a new photo was provided
  if (req.file) {
    // Delete old photo from Cloudinary if it exists
    if (destination.DestinationPhotoID) {
      await deleteFromCloudinary(destination.DestinationPhotoID);
    }

    // Upload new image to Cloudinary
    const uploadResult = await uploadonCloudinary(req.file.path);

    if (!uploadResult) {
      throw new ApiError(500, "Failed to upload destination photo");
    }

    // Add new image details to update data
    updateData.DestinationPhoto = uploadResult.secure_url;
    updateData.DestinationPhotoID = uploadResult.public_id;
  }

  const updatedDestination = await Destination.findByIdAndUpdate(
    destinationId, 
    updateData, 
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiRes(200, updatedDestination, "Destination updated successfully"));
});

// Delete a destination
export const deleteDestination = asyncWrapper(async (req, res) => {
  const { destinationId } = req.params;

  if (!destinationId) {
    throw new ApiError(400, "Destination ID is required");
  }

  const destination = await Destination.findById(destinationId);

  if (!destination) {
    throw new ApiError(404, "Destination not found");
  }

  // Delete the destination photo from Cloudinary if it exists
  if (destination.DestinationPhotoID) {
    await deleteFromCloudinary(destination.DestinationPhotoID);
  }

  await Destination.findByIdAndDelete(destinationId);

  return res
    .status(200)
    .json(new ApiRes(200, {}, "Destination deleted successfully"));
});