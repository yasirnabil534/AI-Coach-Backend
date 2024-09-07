import { OpenAI } from "openai";
import { EventEmitter } from "events";
import fs from "fs";
import { createError } from "../common/error";
require("dotenv").config();

const openAiConfig = {
  apiKey: process.env.OPENAI_API,
};

const openai = new OpenAI(openAiConfig);

async function lookUpTime(location: any): Promise<any> {
  // Implement the function to look up time based on the location
  return "12:00 PM"; // Placeholder return
}

// ^ Function to create assistant
const createAssistant = async (body: any) => {
  try {
    const assistant = await openai.beta.assistants.create(body);
    return assistant;
  } catch (err) {
    throw err;
  }
};

// ^ Function to get list of assistant
const listOfAssistants = async () => {
  try {
    const assistants = await openai.beta.assistants.list();
    return assistants;
  } catch (err) {
    throw err;
  }
};

// ^ Function to get a assistant by id
const getAssistantById = async (id: string) => {
  try {
    const assistent = await openai.beta.assistants.retrieve(id);
    return assistent;
  } catch (err) {
    throw err; 
  }
};

// ^ Function to update a assistant by id
const updateAssistantById = async (id: string, assistantObj: any) => {
  try {
    const assistant = await openai.beta.assistants.update(
      id,
      assistantObj,
    );
    if (assistant) {
      return assistant;
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
};

// ^ Function to delete a assistant by id
const deleteAssistantById = async (id: string) => {
  try {
    const response = await openai.beta.assistants.del(id);
    if (response.deleted) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

// ^ Function to create a thread
const createThread = async () => {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (err) {
    throw err;
  }
};

// ^ Function to get a thread
const getThread = async (thread_id: string) => {
  try {
    const thread = await openai.beta.threads.retrieve(thread_id);
    return thread;
  } catch (err) {
    throw err;
  }
};

// ^ Function to get list of mesages in a thread
const getMessagesOfThread = async (thread_id: string) => {
  try {
    const messageListObj = await openai.beta.threads.messages.list(thread_id);
    return messageListObj.data;
  } catch (err) {
    throw err;
  }
};

// ^ Function to run a thread
const runThread = async (assistant_id: string, thread_id: string, mainPrompt: string, eventEmitter: any, instructions: any) => {
  try {
    const message = await openai.beta.threads.messages.create(
      thread_id,
      {
        role: "user",
        content: mainPrompt,
      }
    );
    const run: any = openai.beta.threads.runs.create (
      thread_id,
      {
        assistant_id,
        instructions,
        stream: true,
      },
      // eventHandler,
    );
    for await (const event of run) {
      eventEmitter.emit("event", event);
    }
  } catch (err) {
    throw err;
  }
};

// ^ Function to create a vector store
const createVectorStore = async (name: string) => {
  try {
    let vectorStore = await openai.beta.vectorStores.create({name});
    return vectorStore;
  } catch (err) {
    throw err;
  }
};

// ^ Function to delete a vector store
const deleteVectorStore = async (id: string) => {
  try {
    const deletedVectorStore = await openai.beta.vectorStores.del(
      id
    );
    return deletedVectorStore;
  } catch (err) {
    throw err;
  }
};

// ^ Function to add files in vector store
const addFileInVectorStore = async (vector_store_id: string, file_path: string) => {
  try {
    const file = await openai.files.create({
      file: fs.createReadStream(file_path),
      purpose: "assistants",
    });
    const myVectorStoreFile = await openai.beta.vectorStores.files.create(
      vector_store_id,
      {
        file_id: file.id
      }
    );
    return myVectorStoreFile;
  } catch (err) {
    throw err;
  }
};

// ^ Function to delete a file from vector store
const deleteFileInVectorStore = async (vector_store_id: string, file_id: string) => {
  try {
    const deletedVectorStoreFile = await openai.beta.vectorStores.files.del(
      vector_store_id,
      file_id
    );
    if (!deletedVectorStoreFile?.deleted) {
      throw createError(400, "Could not delete file from open-ai assistant");
    }
    const file = await openai.files.del(file_id);
    if (!file.deleted) {
      throw createError(400, "Could not delete file from open-ai storage");
    }
    return file.deleted;
  } catch (err) {
    throw err;
  }
};

// ^ Function to transcript an audio file
const transcriptAudio = async (file_path: string) => {
  try {
    // Max file size 25 mb
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(file_path),
      model: "whisper-1",
    });
    return transcription;
  } catch (err) {
    throw err;
  }
};

// ^ Function to translate an audio file
const translateAudio = async (file_path: string) => {
  try {
    // Max file size 25 mb
    const translation = await openai.audio.translations.create({
      file: fs.createReadStream(file_path),
      model: "whisper-1",
    });
    return translation;
  } catch (err) {
    throw err;
  }
};

// ^ Funtion to create an audio file from text
const createAudioFromText = async (message: string, speechFile: string) => {
  try {
    const audio = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: message,
    });
    const buffer = Buffer.from(await audio.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    return audio;
  } catch (err) {
    throw err;
  }
};

export {
  createAssistant,
  listOfAssistants,
  getAssistantById,
  updateAssistantById,
  deleteAssistantById,
  createThread,
  getMessagesOfThread,
  runThread,
  getThread,
  createVectorStore,
  deleteVectorStore,
  addFileInVectorStore,
  deleteFileInVectorStore,
  transcriptAudio,
  translateAudio,
  createAudioFromText,
};