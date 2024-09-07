import { ClientSession } from "mongoose";
import User from "../models/user";
import { createError } from "../common/error";
import { hashPassword } from "../common/manage_pass";

// & Function to find user by ID
const findUserById = async (id: string, session: ClientSession) => {
  try {
    const user = await User.findById(id).session(session).lean();
    if (user) {
      return user;
    } else {
      throw createError(404, "User not found");
    }
  } catch (err) {
    throw err;
  }
};

// & Function to find user using body
const findUserByObject = async (body: any, session: ClientSession) => {
  try {
    const user = await User.findOne(body).session(session).lean();
    return user;
  } catch (err) {
    throw createError();
  }
};

// & Function to create a new user
const createUser = async (userBody: any, password: string, session: ClientSession) => {
  try {
    const hash = await hashPassword(password);
    userBody.password = hash;
    const userCollection = await new User(userBody);
    const user = await userCollection.save({session});
    if (user) {
      return user;
    } else {
      throw createError(400, "User not created");
    }
  } catch (err) {
    throw err;
  }
};

// & Function to get users by querystring
const getUsers = async (req: any, session: ClientSession) => {
  try {
    const query: {[key:string]: any} = {};
    let page = 1, limit = 10;
    let sortBy = "createdAt";
    for (let item in req?.Query) {
      if (item === "page") {
        page = Number(req?.Query?.page);
        if (isNaN(page)) {
          page = 1;
        }
      } else if (item === "limit") {
        limit = Number(req?.Query?.limit);
        if (isNaN(limit)) {
          limit = 10;
        }
      } else if (item === "sortBy") {
        sortBy = req?.Query?.sortBy;
      } else {
        query[item] = req?.Query[item];
      }
    }
    const users = await User.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .session(session);
    const count = await User.countDocuments(query, {session});
    return { users, total: count };
  } catch (err) {
    throw createError(404, "User not found");
  }
};

// & Function to update a user by ID
const updateUserById = async (id: string, body: any, session: ClientSession) => {
  try {
    const query:{[key: string]: any} = await findUserById(id, session);
    for (let item in body) {
      if (item == "birthdate" || item === "last_subscribed" || item === "expires_at") {
        const bday = body?.birthdate;
        query.birthdate = new Date(bday);
      } else {
        query[item] = body[item];
      }
    }
    const updateUser = await User.findByIdAndUpdate(id, query, {
      new: true,
      session,
    }).lean();
    if (!updateUser) {
      throw createError(400, "User not updated");
    } else {
      return { user: updateUser };
    }
  } catch (err) {
    throw err;
  }
};

// & Function to delete a user by ID
const deleteUserById = async (id: string, session: ClientSession) => {
  try {
    const deleteUser = await User.findByIdAndDelete(id).session(session);
    if (!deleteUser) {
      throw createError(404, "User not found");
    } else {
      return { message: "User is deleted" };
    }
  } catch (err) {
    throw err;
  }
};

export {
  findUserById,
  findUserByObject,
  createUser,
  getUsers,
  updateUserById,
  deleteUserById,
}