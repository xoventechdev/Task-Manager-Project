import mongoose from "mongoose";

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    altEmail: { type: String, unique: true },
    password: { type: String, required: true },
    photo: { type: String },
    mobile: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String }, // New field for storing OTP
    otpExpireTime: { type: Date }, // New field for storing OTP expiration time
    role: { type: String, default: "user" }, // Can be 'admin', 'user', etc.
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }], // Optional: pre-assigned projects
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel = mongoose.model("User", userSchema);
