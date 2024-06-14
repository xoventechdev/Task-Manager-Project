import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photo: { type: String },
    mobile: { type: String },
    status: { type: String, default: "active" }, // Can be 'active', 'inactive', etc.
    userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }], // Optional: default project assignments
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const EmployeeModel = mongoose.model("Employee", employeeSchema);
