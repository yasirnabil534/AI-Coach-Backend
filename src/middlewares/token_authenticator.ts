import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from "jsonwebtoken";
import "dotenv/config";
import { createError } from "../common/error";

// * Middleware to authenticate JWT access token
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req?.headers?.authorization;
  const [type, token] = authHeader ? authHeader.split(" ") : [];
  if (!token) {
    res.status(401).json({ message: "Unauthorized token" });
    return;
  }
  const key = process.env.JWT_SECRET;
  if (!key) {
    throw createError(400, "Secret key missing for JWT")
  }
  jwt.verify(token, key, (err, user) => {
    if (err) {
      res.status(401).json({ message: `Unauthorized token for type ${type}` });
      return;
    }
    if (typeof user === 'object' && user !== null && 'id' in user) {
      req.user = {
        id: (user as JwtPayload).id as string,
        email: (user as JwtPayload).email as string,
        type: (user as JwtPayload).type as string,
      };
    } else {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }
    next();
  });
};

export { authenticateToken };
