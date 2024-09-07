import mongoose, { ClientSession } from "mongoose";
import { Request } from "express";
import Bot from "../models/bot";
import { BOT, FILE } from "../types/index";
import { createError } from "../common/error";
import {
  createAssistant,
  listOfAssistants,
  getAssistantById,
  updateAssistantById,
  deleteAssistantById,
  createVectorStore,
  deleteVectorStore,
  addFileInVectorStore,
  deleteFileInVectorStore,
} from "../utils/open_ai_utils";
import {
  addFile,
  getFile,
  deleteFile,
} from "../services/file_services";

// & Function to create bot instructions
const createBotInstructions = (req: any) => {
  try {
    let instruction = "";
    if (req?.body?.name) {
      instruction += `Your name is ${req.body?.name}`;
    }
    if (req?.body?.context) {
      instruction += `\n\nContext:\n${req.body?.context}`;
    }
    if (req?.body?.objective) {
      instruction += `\n\nObjective:\n${req.body.objective}`;
    }
    if (req?.body?.target_audience) {
      instruction += `\n\nTarget audience:\n${req.body.target_audience}`;
    }
    if (req?.body?.call_of_action) {
      instruction += `\n\nPrompt the user to this call of action when applicable:\n${req.body.call_of_action}`;
    }
    if (req?.body?.tone_and_style) {
      instruction += `\n\nTone/Style:\n${req.body.tone_and_style}`;
    }
    if (req?.body?.framework) {
      instruction += `\n\nFramework to follow:\n${req.body.framework}`;
    }
    if (req?.body?.format) {
      instruction += `\n\nFormatting and structure:\n${req.body.format}`;
    }
    if (req?.body?.first_message) {
      instruction += `\n\nFirst message:\n${req.body.first_message}`;
    }
    if (req?.body?.sounds_like) {
      instruction += `\n\nYou sound like:\n${req.body.sounds_like}`;
    }
    instruction += `\n\nIgnore any empty fiends in your instructions.\n\nYou will respond in clean, proper HTML so the application can render it straight away. Normal text will be wrapped in a <p> tag. You will format the links as html links with an <a> tag. Links will have yellow font. Use divs and headings to properly separate different sections. Make sure text doesn't overlap and there is adequate line spacing.`;
    return instruction;
  } catch (err) {
    throw err;
  }
};

// & Function to create bot parameter
const createParam = (botObj: any) => {
  try {
    const botBody: any = {};
    botBody.name = botObj.name;
    botBody.instructions = botObj.instructions;
    botBody.model = botObj.model;
    if (botObj.tools) {
      botBody.tools = botObj.tools;
    }
    if (botObj.top_p) {
      botBody.top_p = botObj.top_p;
    }
    if (botObj.temparature) {
      botBody.temparature = botObj.temparature;
    }
    if (botObj.description) {
      botBody.description = botObj.description;
    }
    if (botObj.max_tokens) {
      botBody.max_tokens = botObj.max_token;
    }
    if (botObj.tool_resources) {
      botBody.tool_resources = botObj.tool_resources;
    }
    return botBody;
  } catch (err) {
    throw err;
  }
};

// & Function to create a new assistant/bot
const createBot = async (botObj: any, session: ClientSession) => {
  try {
    const tools: any = [
      {
        type: "code_interpreter",
      },
      {
        type: "file_search",
      },
    ];
    if (botObj.image_display) {
      tools.push({
        type: "function",
        function: {
          name: "imageDisplay",
          description: "get the current time in a given location",
          parameters: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "the url of an image",
              },
            },
            required: ["url"],
          },
        },
      });
    }
    botObj.tools = tools;
    const vectorStore = await createVectorStore(botObj.name);
    if (!vectorStore.id) {
      throw createError(400, "Can't create vector storage in open AI");
    }
    botObj.vector_store_id = vectorStore.id;
    botObj.tool_resources = {
      file_search: {
        vector_store_ids: [vectorStore.id],
      },
    };
    const botBody = createParam(botObj);
    const openAiBot = await createAssistant(botBody);
    if (openAiBot?.id) {
      botObj.assistant_id = openAiBot.id;
    } else {
      throw createError(400, "Can't create bot in open AI");
    }
    const botCollection = await new Bot(botObj);
    const bot = await botCollection.save({ session });
    if (bot) {
      return bot;
    } else {
      throw createError(400, "Bot couldn't create");
    }
  } catch (err) {
    throw err;
  }
};

// & Function to get botes using querystring
const getBotUsingQureystring = async (req: Request, session: ClientSession) => {
  try {
    const query: {[key: string]: any} = {};
    let page = 1,
      limit = 10;
    let sortBy: any = "createdAt";
    for (let item in req?.query) {
      if (item === "page") {
        page = Number(req?.query?.page);
        if (isNaN(page)) {
          page = 1;
        }
      } else if (item === "limit") {
        limit = Number(req?.query?.limit);
        if (isNaN(limit)) {
          limit = 10;
        }
      } else if (item === "sortBy") {
        sortBy = req?.query?.sortBy;
      } else if (item === "search") {
        if (typeof req.query.search === "string") {
          const regex = new RegExp(req.query.search, "i");
          query.name = { $regex: regex };
        }
      } else {
        query[item] = req?.query[item];
      }
    }
    const bots = await Bot.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .session(session);
    const count = await Bot.countDocuments(query, { session });
    return {
      data: bots,
      metadata: {
        totalDocuments: count,
        currentPage: page,
        totalPage: Math.max(1, Math.ceil(count / limit)),
      },
      message: "Success",
    };
  } catch (err) {
    throw createError(404, "Bot not found");
  }
};

// & Function to find a bot by ID
const findBotById = async (id: string, session: ClientSession) => {
  try {
    if (!id) {
      throw createError(400, "Id need to be provided");
    }
    const bot = await Bot.findById(id).session(session).lean();
    if (bot) {
      return bot;
    } else {
      throw createError(404, "Bot not found");
    }
  } catch (err) {
    throw err;
  }
};

// & Function to find a bot by embedding url
const findBotByUrl = async (embedding_url: string, session: ClientSession) => {
  try {
    if (!embedding_url) {
      throw createError(400, "Url need to be provided");
    }
    const bot = await Bot.findOne({ embedding_url }).session(session).lean();
    if (bot) {
      return bot;
    } else {
      throw createError(404, "Bot not found");
    }
  } catch (err) {
    throw err;
  }
};

// & Function to update a bot by ID
const updateBotById = async (id: string, body: {[key: string]: any}, session: ClientSession) => {
  try {
    const bot: any = await findBotById(id, session);
    for (let item in body) {
      if (typeof item !== 'string') { continue; }
      if (item === "user_id") {
        bot[item] = new mongoose.Types.ObjectId(body[item]);
      } else {
        bot[item] = body[item];
      }
    }
    const req = { body: bot };
    bot.instructions = createBotInstructions(req);
    const tools: any[] = [
      {
        type: "code_interpreter",
      },
    ];
    if (body?.image_display) {
      tools.push({
        type: "function",
        function: {
          name: "imageDisplay",
          description: "get the current time in a given location",
          parameters: {
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "the url of an image",
              },
            },
            required: ["url"],
          },
        },
      });
    }
    bot.tools = tools;
    const botBody = createParam(bot);
    const openAiBot = updateAssistantById(bot.assistant_id, botBody);
    if (!openAiBot) {
      throw createError(400, "Bot not updated in open-ai");
    }
    const updateBot = await Bot.findByIdAndUpdate(id, bot, {
      new: true,
      session,
    }).lean();
    if (!updateBot) {
      throw createError(400, "Bot not updated in DB but updated in open-ai");
    } else {
      return { bot: updateBot };
    }
  } catch (err) {
    throw err;
  }
};

// & Function to delete a bot by ID
const deleteBotById = async (id: string, session: ClientSession) => {
  try {
    const bot: BOT = await findBotById(id, session);
    if (!bot.vector_store_id || !bot.assistant_id) {
      throw createError(400, "No vector store id or assistant id found in bot");
    }
    const isVectorStoreDeleted = await deleteVectorStore(bot.vector_store_id);
    const isDeleted = await deleteAssistantById(bot.assistant_id);
    if (!isDeleted) {
      throw createError(400, "Bot not deleted in open-ai");
    }
    const deleteBot = await Bot.findByIdAndDelete(id).session(session);
    if (!deleteBot) {
      throw createError(404, "Bot not deleted in db but deleted in open-ai");
    } else {
      return { message: "Bot is deleted" };
    }
  } catch (err) {
    throw err;
  }
};

// & Function to add file to bot by ID
const addFileToBot = async (id: string, file_path: string, file: any, session: ClientSession) => {
  try {
    const bot: BOT = await findBotById(id, session);
    if (!bot.vector_store_id) {
      throw createError(400, "No vector store id or assistant id found in bot");
    }
    const myVectorStoreFile = await addFileInVectorStore(
      bot.vector_store_id,
      file_path
    );
    const file_id = myVectorStoreFile?.id;
    if (!file_id) {
      throw createError(400, "File not created in open-ai");
    } else {
      const fileObj: FILE = {
        name: file.originalname,
        size: file.size,
        file_id: file_id,
        bot_id: new mongoose.Schema.Types.ObjectId(id),
      };
      const newFile = await addFile(fileObj, session);
      return newFile;
    }
  } catch (err) {
    throw err;
  }
};

// & Function to delete file from bot by ID
const deleteFileFromBot = async (bot_id: string, file_id: string, session: ClientSession) => {
  try {
    const bot: BOT = await findBotById(bot_id, session);
    if (!bot.vector_store_id) {
      throw createError(400, "No vector store id or assistant id found in bot");
    }
    const file = await getFile(file_id, session);
    if (!file.file_id) {
      throw createError(400, "No openai file id found in bot");
    }
    await deleteFileInVectorStore(bot.vector_store_id, file.file_id);
    const message = await deleteFile(file_id, session);
    return message;
  } catch (err) {
    throw err;
  }
};

// & Function to count bot opened by company
const countBot = async (company_id: string, session: ClientSession) => {
  try {
    const count = await Bot.countDocuments({ company_id }, { session });
    return count;
  } catch (err) {
    throw err;
  }
};

export {
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
};
