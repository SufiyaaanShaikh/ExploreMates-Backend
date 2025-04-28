import express from "express";
import { connectDB } from "./db/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./utils/globalErrorhandler.js";
import { authRoutes } from "./routes/auth.routes.js";
import cors from "cors";
import { userRoutes } from "./routes/user.routes.js";
import { tripRoutes } from "./routes/trip.routes.js";
import { reviewRoutes } from "./routes/review.routes.js";
import { messageRoutes } from "./routes/message.routes.js";

dotenv.config({ path: "./.env" });
const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/auth", authRoutes); //   /api/auth/login
app.use("/api/user", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/messages", messageRoutes);

app.use(globalErrorHandler);
const PORT = process.env.PORT || 5017;

(async () => {
  try {
    // Connect to the database
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
})();
