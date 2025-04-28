// src/controllers/message.controller.js
import asyncWrapper from "../middleware/asyncWrapper.middleware.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Trip } from "../models/trip.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiRes } from "../utils/ApiRes.js";
import { sendConnectionRequestEmail } from "../utils/emailService.js";

// Send a connection request to a trip creator
export const sendConnectionRequest = asyncWrapper(async (req, res) => {
  const { tripId } = req.params;
  const { content } = req.body;
  const senderId = req.user._id;

  // Validate required fields
  if (!content) {
    throw new ApiError(400, "Message content is required");
  }

  // Find the trip
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new ApiError(404, "Trip not found");
  }

  // Get the recipient (trip creator)
  const recipientId = trip.user;
  
  // Prevent sending messages to your own trips
  if (senderId.toString() === recipientId.toString()) {
    throw new ApiError(400, "You cannot send connection requests to your own trips");
  }

  // Find sender and recipient details
  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  if (!sender || !recipient) {
    throw new ApiError(404, "User not found");
  }

  // Create a new message
  const newMessage = await Message.create({
    sender: senderId,
    recipient: recipientId,
    trip: tripId,
    content
  });

  try {
    // Send email to the trip creator
    await sendConnectionRequestEmail({
      sender: {
        name: sender.name,
        email: sender.email,
        phone: sender.phone,
        age: sender.age
      },
      recipient: {
        name: recipient.name,
        email: recipient.email
      },
      trip: {
        title: trip.title,
        destination: trip.destination,
        duration: trip.duration
      },
      message: content
    });

    // Update message with email sent status
    newMessage.emailSent = true;
    await newMessage.save();
  } catch (error) {
    console.error("Failed to send email:", error);
    // We don't want to fail the request if email fails
    // Just log it and continue
  }

  return res
    .status(201)
    .json(new ApiRes(201, newMessage, "Connection request sent successfully"));
});

// Get all messages sent by the current user
export const getSentMessages = asyncWrapper(async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.find({ sender: userId })
    .populate("recipient", "name profilePhoto _id")
    .populate("trip", "title destination _id")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiRes(200, messages, "Sent messages retrieved successfully"));
});

// Get all messages received by the current user
export const getReceivedMessages = asyncWrapper(async (req, res) => {
  const userId = req.user._id;

  const messages = await Message.find({ recipient: userId })
    .populate("sender", "name profilePhoto _id")
    .populate("trip", "title destination _id")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiRes(200, messages, "Received messages retrieved successfully"));
});

// Mark a message as read
export const markMessageAsRead = asyncWrapper(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findOne({ 
    _id: messageId,
    recipient: userId
  });

  if (!message) {
    throw new ApiError(404, "Message not found or you don't have permission to access it");
  }

  message.status = "read";
  await message.save();

  return res
    .status(200)
    .json(new ApiRes(200, message, "Message marked as read"));
});

// Delete a message
export const deleteMessage = asyncWrapper(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findOne({
    _id: messageId,
    $or: [{ sender: userId }, { recipient: userId }]
  });

  if (!message) {
    throw new ApiError(404, "Message not found or you don't have permission to delete it");
  }

  await Message.findByIdAndDelete(messageId);

  return res
    .status(200)
    .json(new ApiRes(200, null, "Message deleted successfully"));
});