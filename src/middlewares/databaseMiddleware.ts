import { Request, Response, NextFunction } from "express";
import { getDatabaseConnection } from "../db/db";

export const databaseMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const host = req.hostname;
      const dbConnection = await getDatabaseConnection(host);
      res.locals.dbConnection = dbConnection;

      next();
    } catch (error) {
      console.error("Database connection error:", error);
      res.status(500).json({ status: false, message: "Database connection failed." });
    }
  };
