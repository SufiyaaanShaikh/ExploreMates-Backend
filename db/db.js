import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/ExploreMates`);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log(err);
  }
}
