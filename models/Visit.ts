import mongoose, { Schema, Model } from "mongoose";

export interface IVisit {
  linkId: mongoose.Types.ObjectId;
  code: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  place: string;
  device: string;
  userAgent: string;
  createdAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    linkId: {
      type: Schema.Types.ObjectId,
      ref: "ShortLink",
      required: true,
      index: true,
    },
    code: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: 0 },
    place: { type: String, default: "" },
    device: { type: String, default: "" },
    userAgent: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VisitSchema.index({ linkId: 1, createdAt: -1 });

const Visit: Model<IVisit> =
  mongoose.models.Visit || mongoose.model<IVisit>("Visit", VisitSchema);

export default Visit;
