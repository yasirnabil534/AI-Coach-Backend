import { Request, Response, NextFunction } from "express";

const process_query = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req?.query) {
      const newQuery = { ...req.query } as Record<string, any>;
      for (let item in newQuery) {
        if (newQuery[item] === "true") {
          newQuery[item] = true;
        } else if (newQuery[item] === "false") {
          newQuery[item] = false;
        } else if (newQuery[item] === "undefined") {
          newQuery[item] = undefined;
        } else if (newQuery[item] === "null") {
          newQuery[item] = null;
        }
        if (item === "sortOrder") {
          if (newQuery.sortOrder === "desc" && newQuery.sortBy) {
            newQuery.sortBy = `-${newQuery.sortBy}`;
          }
          delete newQuery.sortOrder;
        }
        if (!req.query[item]) {
          delete req.query[item];
        }
      }
      req.Query = newQuery;
    }
    next();
  } catch (err) {
    throw err;
  }
};

export { process_query };
