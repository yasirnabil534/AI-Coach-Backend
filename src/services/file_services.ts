import { Request } from 'express';
import mongoose, { ClientSession } from 'mongoose';
import File from '../models/file';
import { FILE } from '../types/index';
import { createError } from "../common/error";

// & Function to check memory of a company
const checkMemory = async (company_id: string, fileSize: number, session: ClientSession) => {
  try {
    const result = await File.aggregate([
      {
        $match: { company_id: new mongoose.Types.ObjectId(company_id) }
      },
      {
        $group: {
          _id: "$company_id",
          totalSize: { $sum: "$size" }
        }
      }
    ]).session(session);
    const totalSize = ((result.length) > 0 ? result[0].totalSize : 0) + fileSize;
    return totalSize;
  } catch (err) {
    throw err;
  }
};

// & Function to add a file to a bot
const addFile = async (fileObj: FILE, session: ClientSession) => {
  try {
    const fileCollection = await new File(fileObj);
    const file = await fileCollection.save({ session });
    if (!file) {
      throw createError(400, "File not created in DB");
    }
    return file;
  } catch (err) {
    throw err;
  }
};

// & Function to get files using querystring
const getFiles = async (req: Request, session: ClientSession) => {
  try {
    const query: {[key:string]: any} = {};
    let page = 1, limit = 10;
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
      } else if (item === "company_id" || item === "bot_id" || item === "thread_id") {
        if (typeof req.query[item] === "string") {
          query[item] = new mongoose.Types.ObjectId(req?.query[item]);
        }
      } else if (item === "search") {
        if (typeof req.query.search === "string") {
          const regex = new RegExp(req.query.search, "i");
          query.name = { $regex: regex };
        }
      } else {
        query[item] = req?.query[item];
      }
    }
    const files = await File.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .session(session);
    const count = await File.countDocuments(query, {session});
    return {
      data: files,
      metadata: {
        totalDocuments: count,
        currentPage: page,
        totalPage: Math.max(1, Math.ceil(count / limit)),
      },
      message: "Success",
    };
  } catch (err) {
    throw err;
  }
};

// & Function to get a file
const getFile = async (id: string, session: ClientSession) => {
  try {
    const file = await File.findById(id).session(session).lean();
    if (!file) {
      throw createError(404, "File not found");
    }
    return file;
  } catch (err) {
    throw err;
  }
}

// & Function to delete a file
const deleteFile = async (id: string, session: ClientSession) => {
  try {
    const file = await File.findByIdAndDelete(id).session(session);
    if (!file) {
      throw createError(404, "File not found");
    }
    return { message: "File deleted" };
  } catch (err) {
    throw err;
  }
};

export {
  addFile,
  getFiles,
  getFile,
  deleteFile,
  checkMemory,
}

// {
//   fieldname: 'file',
//   originalname: 'GRE 3 Geometry.pdf',
//   encoding: '7bit',
//   mimetype: 'application/pdf',
//   destination: '.\\src\\assets\\files',
//   filename: '18071730GRE 3 Geometry.pdf',
//   path: 'src\\assets\\files\\18071730GRE 3 Geometry.pdf',
//   size: 6333622
// }