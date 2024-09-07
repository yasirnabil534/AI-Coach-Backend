import mongoose from 'mongoose';
import { FILE } from "../types/index";

const fileSchema = new mongoose.Schema<FILE>(
  {
    bot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
    },
    thread_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread',
    },
    name: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    file_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);
export default File;
