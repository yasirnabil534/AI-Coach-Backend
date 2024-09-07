import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { ClientSession } from "mongoose";
import User from "../models/user";
import { checkHash } from "../common/manage_pass";
import { createError } from "../common/error";
import { USER } from "../types/index";

interface TokenPayload extends JwtPayload {
  id?: string;
  email?: string;
  type?: string;
}

// & Generate Access token and Refresh token
const generateTokens = (user: USER) => {
  try {
    const key = process.env.JWT_SECRET;
    if (!key) {
      throw createError(400, "Secret key missing for JWT")
    }
    const tokenForAccess = jwt.sign(
      { email: user.email, id: user._id, type: user.type },
      key,
      {
        expiresIn: "10h",
      }
    );
    const tokenForRefresh = jwt.sign({ id: user._id }, key, {
      expiresIn: "6d",
    });
    const userJsonObj = user;
    userJsonObj.accessToken = tokenForAccess;
    userJsonObj.refreshToken = tokenForRefresh;
    return userJsonObj;
  } catch (err) {
    throw err;
  }
};

// & Handle Email Login function
const handleEmailLogin = async (email: string, password: string, session: ClientSession) => {
  try {
    const user: (USER | null) = await User.findOne({ email }).session(session).lean();
    if (user) {
      const pass = user?.password;
      if (!pass) {
        throw createError(401, "Invalid password");
      }
      const isValidPassword = await checkHash(password, pass);
      if (isValidPassword) {
        const userJsonObj = generateTokens(user);
        return { user: userJsonObj };
      } else {
        throw createError(401, "Invalid password");
      }
    } else {
      throw createError(404, "User not found");
    }
  } catch (err) {
    throw err;
  }
};

// & Handle Refresh Token function
const handleRefreshTokenLogin = async (refreshToken: string, session: ClientSession) => {
  try {
    const key = process.env.JWT_SECRET;  
    if (!key) {
      throw createError(400, "Secret key missing for JWT")
    }
    const data = jwt.verify(
      refreshToken,
      key,
      async (err: VerifyErrors | null, payload: string | TokenPayload | undefined) => {
        try {
          if (err) {
            throw createError(401, "Unauthorised refresh token");
          } else {
            const { id } = payload as TokenPayload;
            if (!id) {
              throw createError(400, "id missing for JWT")
            }
            const user: (USER | null) = await User.findById(id).session(session).lean();
            if (!user) {
              throw createError(401, "Unauthorised user");
            } else {
              const userJsonObj = generateTokens(user);
              return { user: userJsonObj };
            }
          }
        } catch (err) {
          throw err;
        }
      }
    );
    return data;
  } catch (err) {
    throw err;
  }
};

export {
  handleEmailLogin,
  handleRefreshTokenLogin,
};