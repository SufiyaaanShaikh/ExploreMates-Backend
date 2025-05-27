import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        DestinationPhoto: {
            type: String,
        },
        DestinationPhotoID: {
            type: String,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        bestTimeToVisit: {
            type: String,
            required: true,
            trim: true,
        },
        travelDuration: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { timestamps: true }
);

export const Destination = mongoose.model("Destination", destinationSchema);


















