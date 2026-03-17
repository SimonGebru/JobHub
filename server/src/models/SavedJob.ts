import { Schema, model } from "mongoose";

const savedJobSchema = new Schema(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    source: {
      type: String,
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    locationText: {
      type: String,
      default: "",
    },
    remoteType: {
      type: String,
      default: "unknown",
    },
    publishedAt: {
      type: String,
      default: null,
    },
    applyUrl: {
      type: String,
      required: true,
    },
    jobUrl: {
      type: String,
      required: true,
    },
    descriptionText: {
      type: String,
      default: "",
    },
    seniority: {
      type: String,
      default: "unknown",
    },
    skills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["saved", "applied", "interview", "rejected"],
      default: "saved",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SavedJob = model("SavedJob", savedJobSchema);