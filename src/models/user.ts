import mongoose from 'mongoose';
import { USER } from '../types/index';

const userSchema = new mongoose.Schema<USER>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    birthdate: {
      type: Date,
      default: null,
    },
    type: {
      type: String,
      enum: ["admin", "user", "super-admin"],
      default: "user",
    },
    last_subscribed: {
      type: Date,
      default: null,
    },
    expires_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
