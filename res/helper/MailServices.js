import nodemailer from "nodemailer";
import { UserModel } from "../models/user/UserModel.js";

// Function to configure email transporter (choose either Gmail or SMTP)
function getTransporter(options) {
  if (options.useGmail) {
    console.log("Using Google");
    // Configure Gmail transporter with app password (more secure than less secure apps)
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Use app password, not regular password
      },
    });
  } else {
    // Configure generic SMTP transporter
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE, // Use true for TLS, false for non-secure
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
}

// Function to send email verification email
export const sendVerificationEmail = async (email, otp) => {
  try {
    const transporter = getTransporter({
      useGmail: true,
    }); // Replace with your Gmail credentials and app password
    const mailOptions = {
      from: '"Your App Name" <noreply@yourapp.com>', // Replace with your app name and email
      to: email,
      subject: "Email Verification OTP",
      text: `Your verification code is ${otp}. This code is valid for 15 minutes. Please do not share this code with anyone.`,
    };

    await transporter.sendMail(mailOptions);

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Function to send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = getTransporter({
      useGmail: true,
    }); // Replace with your Gmail credentials and app password

    const mailOptions = {
      from: '"Task Manager" <noreply@yourapp.com>', // Replace with your app name and email
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset for your account. Please click the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
