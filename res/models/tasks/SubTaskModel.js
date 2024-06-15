import mongoose from "mongoose";

const SubTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const SubTaskModel = mongoose.model("SubTask", SubTaskSchema);
