import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../../helper/MailServices.js";
import { UserModel } from "../../models/user/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userSignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: "error",
        response: "Please provide all the required fields",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "warning", response: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    const emailStatus = await sendVerificationEmail(user.email, otp);
    if (!emailStatus) {
      return res.status(500).json({
        status: "error",
        response: "Verification email sending failed. Please try again",
      });
    }

    res.status(201).json({
      status: "success",
      response: "User created successfully. Please verify your email address.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      response: err.message,
    });
  }
};

export const userSignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for existing user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "error",
        response: "The user does not exist. Please create your account.",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        response: "Invalid password. Please try with your valid password",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        status: "warning",
        response: "Please verify your email address",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60, // Expires in 1 hour
    });

    res.status(200).json({
      status: "success",
      token,
      response: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      response: err.message,
    });
  }
};

export const emailVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Validate request body
    if (!email || !otp) {
      return res.status(400).json({
        status: "error",
        response: "Please provide both email and OTP",
      });
    }

    // 2. Find the user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "error",
        response: "Invalid email address",
      });
    }

    // 3. Verify OTP
    if (user.otp !== otp) {
      return res.status(401).json({
        status: "error",
        response: "Invalid OTP. Please, try with a valid OTP.",
      });
    }

    // 4. Check Expiration
    if (Date.now() > user.otpExpireTime) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      user.otp = otp;
      user.otpExpireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      const emailStatus = await sendVerificationEmail(user.email, otp);
      if (!emailStatus) {
        return res.status(500).json({
          status: "error",
          response: "Verification email sending failed. Please try again",
        });
      }

      return res.status(401).json({
        status: "warning",
        response:
          "Your OTP is expired. Requested for new OTP. Please, check your inbox.",
      });
    }

    // 5. Update user status to verified
    user.isEmailVerified = true;
    user.otp = undefined; // Clear OTP after successful verification
    user.otpExpireTime = undefined;

    await user.save();

    res.status(200).json({
      status: "success",
      response: "Email verification successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      response: err.message,
    });
  }
};

export const passwordForgot = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "warning", response: "Email address not found" });
    }

    // Generate a random password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    user.otp = resetToken;
    user.otpExpireTime = resetExpire;
    await user.save();

    // Send password reset email
    const emailStatus = await sendPasswordResetEmail(email, resetToken);
    if (!emailStatus) {
      return res.status(500).json({
        status: "error",
        response: "Password reset request failed. Please try again",
      });
    }

    res.status(200).json({
      status: "success",
      response: "Password reset link sent to your email",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", response: err.message });
  }
};

export const passwordReset = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await UserModel.findOne({
      otp: token,
      otpExpireTime: { $gt: Date.now() }, // Check for unexpired token
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: "warning", response: "Invalid token or expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = undefined; // Clear token after successful reset
    user.otpExpireTime = undefined;

    await user.save();

    res
      .status(200)
      .json({ status: "success", response: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", response: err.message });
  }
};

export const userProfileUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;
    const email = req.email;

    // Allow updates to specific fields (e.g., firstName, lastName, photo)
    const allowedUpdates = ["firstName", "lastName", "email", "mobile"];
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate) {
      return res
        .status(400)
        .json({ status: "warning", response: "Invalid update fields" });
    }

    const exUser = await UserModel.findOne({
      _id: id,
    });

    if (!exUser) {
      return res
        .status(404)
        .json({ status: "warning", response: "User not found" });
    }

    if (email === updates.email) {
      await UserModel.findByIdAndUpdate({ email: email }, updates, {
        new: true,
      });
      res.status(200).json({
        status: "success",
        response: "User profile updated successfully.",
      });
    } else {
      updates.altEmail = updates.email;
      updates.email = email;
      await UserModel.findByIdAndUpdate({ email: email }, updates, {
        new: true,
      });
      return res.status(200).json({
        status: "success",
        response:
          "User profile updated successfully. But, you have to verify your email. ",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", response: err.message });
  }
};

export const emailVerifyRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "warning", response: "Email address not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    user.otpExpireTime = Date.now() + 15 * 60 * 1000; // 10 minutes
    await user.save();
    const emailStatus = await sendVerificationEmail(user.email, otp);
    if (!emailStatus) {
      return res.status(500).json({
        status: "error",
        response: "Verification email sending failed. Please try again",
      });
    }
    res.status(200).json({
      status: "success",
      response: "Verification email sent to your email",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", response: err.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const exUser = await UserModel.findOne({
      _id: id,
    });

    if (!exUser) {
      return res
        .status(404)
        .json({ status: "warning", response: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      response: exUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", response: err.message });
  }
};
