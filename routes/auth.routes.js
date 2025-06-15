import express from "express";
import { 
  login, 
  logout, 
  sendSignupOTP, 
  verifyOTPAndSignup, 
  resendOTP 
} from "../controllers/auth.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/send-signup-otp").post(sendSignupOTP);
router.route("/verify-otp-signup").post(verifyOTPAndSignup);
router.route("/resend-otp").post(resendOTP);
router.route("/logout").post(verifyUser, logout);

export const authRoutes = router;