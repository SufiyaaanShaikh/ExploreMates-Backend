// src/routes/message.routes.js
import express from "express";
import {
  sendConnectionRequest,
  getSentMessages,
  getReceivedMessages,
  markMessageAsRead,
  deleteMessage
} from "../controllers/message.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected with auth middleware
router.use(verifyUser);

// Message routes
router.post("/connect/:tripId", sendConnectionRequest);
router.get("/sent", getSentMessages);
router.get("/received", getReceivedMessages);
router.put("/:messageId/read", markMessageAsRead);
router.delete("/:messageId", deleteMessage);

export const messageRoutes = router;