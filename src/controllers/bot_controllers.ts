import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { validationResult } from "express-validator";
import { BOT } from "../types/index";
import {
  createBotInstructions,
  createBot,
  getBotUsingQureystring,
  findBotById,
  findBotByUrl,
  updateBotById,
  deleteBotById,
  addFileToBot,
  deleteFileFromBot,
  countBot,
} from "../services/bot_services";
import { checkMemory } from "../services/file_services";
import { createError } from "../common/error";
import { userType } from "../utils/enums";

// * Function to create a bot/assistant
const create = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0];
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, firstError.msg));
    }
    const id = req.user.id;
    const botObj: any = {
      user_id: id,
      model: "gpt-4-turbo",
    };
    for (let item in req?.body) {
      if (item === "user_id") {
        botObj[item] = new mongoose.Types.ObjectId(req.body[item]);
      } else if (item === "model") {
        botObj[item] = req?.body?.model || "gpt-4-turbo";
      } else {
        botObj[item] = req.body[item];
      }
    }
    botObj.instructions = createBotInstructions(req);
    const bot = await createBot(botObj, session);
    if (!bot) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, "Bot not created"));
    } else {
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ message: "Bot created successfully", bot });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// * Function to get all the bots using querystring
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const bots = await getBotUsingQureystring(req, session);
    if (bots) {
      await session.commitTransaction();
      session.endSession();
      res.status(200).json(bots);
    } else {
      await session.abortTransaction();
      session.endSession();
      return next(createError(404, "Bot not found"));
    }
  } catch (err) {
    next(err);
  }
};

// * Function to get a bot by ID
const getBotByID = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const id = req?.params?.id;
    const bot = await findBotById(id, session);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ data: bot });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// * Function to get a bot by embedding url
const getBotByURL = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const url = req?.params?.url;
    const bot = await findBotByUrl(url, session);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ data: bot });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// * Function to update bot by ID
const updateBotByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const id = req.params.id;
    if (!id) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, "Id not provided"));
    }
    if (req?.body) {
      const bot = await updateBotById(id, req.body, session);
      if (!bot) {
        await session.abortTransaction();
        session.endSession();
        return next(createError(400, "Bot not updated"));
      } else {
        await session.commitTransaction();
        session.endSession();
        res.status(200).json(bot);
      }
    } else {
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, "No body provided"));
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// * Function to delete a bot by ID
const deleteBotByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const id = req.params.id;
    if (!id) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, "Id not provided"));
    }
    const status = await deleteBotById(id, session);
    if (!status) {
      await session.abortTransaction();
      session.endSession();
      return next(createError(400, "Bot not deleted"));
    } else {
      await session.commitTransaction();
      session.endSession();
      res.status(200).json({ message: "Bot deleted successfully" });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// * Function to upload a file to the bot by ID
const uploadFileToBot = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  let fullPath: string | undefined | null = null;
  try {
    session.startTransaction();
    if (!req.file) {
      return next(createError(400, "File not uploaded"));
    }
    const fileLocation = process.env.BULK_FILE_LOCATION;
    if (!fileLocation) {
      return next(createError(400, "env for file location is missing"));
    }
    fullPath = path.join(fileLocation, req.file.filename);
    const bot_id = req?.body?.bot_id;
    if (!bot_id) {
      return next(createError(400, "bot_id not provided"));
    }
    const file = await addFileToBot(
      bot_id,
      fullPath,
      req.file,
      session
    );
    if (typeof fullPath === "string") {
      fs.unlinkSync(fullPath);
    }
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ message: "File added successfully", file });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (typeof fullPath === "string") {
      fs.unlinkSync(fullPath);
    }
    next(err);
  }
};

// * Function to delete a file from Bot by ID
const deleteFileFromBotByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const bot_id = req?.body?.bot_id;
    const file_id = req?.body?.file_id;
    if (!bot_id || !file_id) {
      return next(
        createError(400, "Both bot_id and file_id need to be provided")
      );
    }
    const message = await deleteFileFromBot(bot_id, file_id, session);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(message);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export {
  create,
  getAll,
  getBotByID,
  getBotByURL,
  updateBotByID,
  deleteBotByID,
  uploadFileToBot,
  deleteFileFromBotByID,
};
