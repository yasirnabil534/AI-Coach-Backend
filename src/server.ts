import "dotenv/config";
import mongoose from "mongoose";
import app from "./app/app";
import logger from "./config/logger";

const port = process.env.PORT || 5000;
const dbUri = process.env.DB_URI || "";

// * MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(dbUri);
    logger.info("DB", "Server is connected to MongoDB");
  } catch (err) {
    logger.error("DB", "DB connection not established", err);
    throw err;
  }
};

// * Server listening function
app.listen(port, async () => {
  try {
    await connectDB();
    logger.info("Server", "Server is running");
  } catch (err) {
    logger.error("Server", "Server cannot be connected", err);
  }
});
