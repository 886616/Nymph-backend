import { Response } from "express";
import { CustomError } from "./custom.error";

export const sendErrorResponse = (res: Response, error: CustomError) => {
  return res.status(error.statusCode).json({
    status: false,
    message: error.message,
  });
};
