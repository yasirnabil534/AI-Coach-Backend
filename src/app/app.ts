import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json());

// * Setting streaming for openAI
app.use((req: Request, res: Response, next: NextFunction) => {
  res.sseSetup = () => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
  };

  res.sseSend = (data: string) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  res.sseStop = () => {
    res.end();
  };

  next();
});

export default app;
