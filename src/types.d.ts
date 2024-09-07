import { Request } from 'express';
import { Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      id: string,
      email: string,
      type: string
    },
    Query: object,
    file: {
      filename: string,
      size: number,
      
    }
  }
  interface Response {
    sseSetup: () => void;
    sseSend: (data: string) => void;
    sseStop: () => void;
  }
}

declare global {
  interface Error {
    status?: Number;
  }
}