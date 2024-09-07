import mongoose from "mongoose";
import { BOT } from "../types/index";

const botSchema = new mongoose.Schema<BOT>(
  {
    name: {
      type: String,
      default: '',
    },
    assistant_id: {
      type: String,
      default: '',
    },
    vector_store_id: {
      type: String,
      default: '',
    },
    logo_light: {
      type: String,
      default: '',
    },
    logo_dark: {
      type: String,
      default: '',
    },
    bot_logo: {
      type: String,
      default: '',
    },
    user_logo: {
      type: String,
      default: '',
    },
    bg_light: {
      type: String,
      default: '',
    },
    bg_dark: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    system_prompt: {
      type: String,
      default: '',
    },
    faq: {
      type: Boolean,
      default: false,
    },
    primary_color: {
      type: String,
      default: '#044088',
    },
    secondary_color: {
      type: String,
      default: '#050260',
    },
    primary_font_color: {
      type: String,
      default: '#ffffff',
    },
    secondary_font_color: {
      type: String,
      default: '#ffffff',
    },
    primary_color_dark: {
      type: String,
      default: '#044088',
    },
    secondary_color_dark: {
      type: String,
      default: '#050260',
    },
    primary_font_color_dark: {
      type: String,
      default: '#ffffff',
    },
    secondary_font_color_dark: {
      type: String,
      default: '#ffffff',
    },
    model: {
      type: String,
      default: 'gpt-4-turbo',
    },
    temperature: {
      type: Number,
      default: 0.5,
    },
    max_token: {
      type: Number,
      default: 1000,
    },
    stream: {
      type: Boolean,
      default: false,
    },
    top_p: {
      type: Number,
      default: 0.5,
    },
    frequency_penalty: {
      type: Number,
      default: 0.5,
    },
    unique_id: {
      type: String,
      default: "",
    },
    first_message: {
      type: String,
      default: "",
    },
    context: {
      type: String,
      default: "",
    },
    objective: {
      type: String,
      default: "",
    },
    target_audience: {
      type: String,
      default: "",
    },
    embedding_url: {
      type: String,
      unique: true,
      required: true,
    },
    tone_and_style: {
      type: String,
      default: "",
    },
    framework: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      enum: ["en", "bn"],
      default: "en",
    },
    bot_avatar: {
      type: String,
      default: "",
    },
    user_avatar: {
      type: String,
      default: "",
    },
    web_url: {
      type: String,
      default: "",
    },
    sounds_like: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Bot = mongoose.model("Bot", botSchema);
export default Bot;