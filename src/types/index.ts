import { ObjectId } from "mongoose";

interface USER {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  type: string;
  image?: string;
  phone?: string;
  birthdate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  accessToken?: string;
  refreshToken?: string;
  last_subscribed?: Date;
  expires_at?: Date;
}

interface BOT {
  _id?: string;
  user_id?: Object;
  name?: string;
  assistant_id?: string;
  vector_store_id?: string;
  logo_light?: string;
  logo_dark?: string;
  bot_logo?: string
  user_logo?: string;
  bg_light?: string;
  bg_dark?: string;
  description?: string
  system_prompt?: string;
  faq?: string
  primary_color?: string;
  secondary_color?: string;
  primary_color_dark?: string;
  secondary_color_dark?: string;
  primary_font_color?: string;
  secondary_font_color?: string;
  primary_font_color_dark?: string;
  secondary_font_color_dark?: string;
  model?: string;
  temperature?: number;
  max_token?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  unique_id?: string;
  first_message?: string;
  context?: string;
  objective?: string;
  target_audience?: string;
  embedding_url?: string;
  tone_and_style?: string;
  framework?: string;
  language?: string;
  bot_avatar?: string;
  user_avatar?: string;
  web_url?: string;
  sounds_like?: string;
}

interface FILE {
  bot_id?: ObjectId;
  thread_id?: ObjectId;
  name?: string;
  size?: number;
  file_id?: string;
  url?: string;
}

export {
  USER,
  BOT,
  FILE,
};
