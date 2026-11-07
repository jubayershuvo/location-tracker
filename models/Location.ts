import mongoose, { Schema, Model } from "mongoose";

export interface ILocation {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  recordedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    accuracy: {
      type: Number,
      default: 0,
    },

    altitude: {
      type: Number,
      default: null,
    },

    speed: {
      type: Number,
      default: null,
    },

    heading: {
      type: Number,
      default: null,
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Location: Model<ILocation> =
  mongoose.models.Location ||
  mongoose.model<ILocation>("Location", LocationSchema);

export default Location;