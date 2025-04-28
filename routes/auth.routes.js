import express from "express";
import { login, logout, signUp } from "../controllers/auth.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/signup").post(signUp);
router.route("/logout").post(verifyUser, logout);

export const authRoutes = router;
