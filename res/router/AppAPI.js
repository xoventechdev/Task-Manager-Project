import { Router } from "express";
import {
  emailVerify,
  emailVerifyRequest,
  getUserProfile,
  passwordForgot,
  passwordReset,
  userProfileUpdate,
  userSignIn,
  userSignUp,
} from "../controllers/user/UserController.js";

const router = Router();

router.post("/signup", userSignUp);
router.post("/signin", userSignIn);
router.post("/emailVerify", emailVerify);
router.post("/passwordForgot", passwordForgot);
router.post("/passwordReset", passwordReset);
router.post("/userProfileUpdate/:id", userProfileUpdate);
router.post("/emailVerifyRequest", emailVerifyRequest);
router.get("/getUserProfile/:id", getUserProfile);

export default router;
