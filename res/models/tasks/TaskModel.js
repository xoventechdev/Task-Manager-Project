import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, required: true, default: "ToDo" }, // Can be 'ToDo', 'InProgress', 'Done', 'Completed'
    priority: { type: String, default: "Medium" }, // Can be 'Low', 'Medium', 'High'
    completedDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "Employee" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    comments: [
      {
        author: { type: Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const TaskModel = mongoose.model("Task", taskSchema);
