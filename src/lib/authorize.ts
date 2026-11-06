import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./token";
import { AUTHORIZE_TOKEN_MISSING_OR_INVALID, UNAUTHORIZE_ACCESS_OR_INVALID_TOKEN } from "../constants/general";

declare module "express-serve-static-core" {
    interface Request {
        tokenData?: object | string;
    }
}


export async function authorize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ status: false, message: AUTHORIZE_TOKEN_MISSING_OR_INVALID });
            return;
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = await verifyToken(token);
        req.tokenData = decodedToken;
        next();
    } catch (error) {
        console.error("Authorization error:", error);
        res.status(401).json({ status: false, message: UNAUTHORIZE_ACCESS_OR_INVALID_TOKEN });
    }
}
