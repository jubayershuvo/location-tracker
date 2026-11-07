import mongoose, { Schema, Model } from "mongoose";

export interface IShortLink {
  code: string;
  url: string;
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShortLinkSchema = new Schema<IShortLink>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 80,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ShortLink: Model<IShortLink> =
  mongoose.models.ShortLink ||
  mongoose.model<IShortLink>("ShortLink", ShortLinkSchema);

export default ShortLink;
