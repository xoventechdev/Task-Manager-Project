import { Router } from "express";
import {
  emailVerify,
  userSignIn,
  userSignUp,
} from "../controllers/user/UserController.js";

const router = Router();

router.post("/signup", userSignUp);
router.post("/signin", userSignIn);
router.post("/emailVerify", emailVerify);

export default router;
