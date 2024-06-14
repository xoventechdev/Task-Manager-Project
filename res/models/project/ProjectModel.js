import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    note: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    attachments: [{ type: String }], // File paths or references (consider security measures)
    ownerID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ProjectModel = mongoose.model("Project", projectSchema);
