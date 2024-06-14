import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import expressMongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import router from "./res/router/AppAPI.js";
const app = express();

dotenv.config();
app.use(bodyParser.json());
app.use(cors());
app.use(expressMongoSanitize());
app.use(helmet());
app.use(hpp());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/v1/", router);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    response: "The app is loaded successfully",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Page not found",
  });
});

export default app;
