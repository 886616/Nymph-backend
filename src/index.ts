import "reflect-metadata";
import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import "../env";
import { initRoutes } from "./routes";
import { databaseMiddleware } from "./middlewares/databaseMiddleware";
import logger from "./logger";
import requestLogger from "./middlewares/requestLogger";
import { INTERNAL_SERVER_ERROR } from "./constants/general";

const app = express();
const PORT = process.env.PORT;

const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: corsOrigins.length ? corsOrigins : '*',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: corsOrigins.length > 0, // Allow cookies only for explicit origins
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(requestLogger); // log all incoming requests

app.get("/", async (req: Request, res: Response) => {
  res.json({
    status: true,
    message: "EVENTS PROJECT WORK PERFECT",
  });
});

// Database Middleware
app.use(databaseMiddleware);

// Initialize Routes
initRoutes(app);

// To maintain error logs (Error Logging Middleware - must stay after the routes)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error in ${req.method} ${req.url} - ${err.message}`, { stack: err.stack });

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ status: false, message: "Invalid JSON body" });
  }
  res.status(500).json({ status: false, message: INTERNAL_SERVER_ERROR });
});

const server = http.createServer(app);

const onServerStart = (): void => {
  const ENVIRONMENT = process.env.NODE_ENV || "development";
  console.log(`Server Listening On Port ${PORT}, ENVIRONMENT=${ENVIRONMENT}`);
};

const startServer = async (): Promise<void> => {
  try {
    server.listen(PORT, onServerStart);
  } catch (error) {
    console.error(
      "Failed to start the server:",
      (error as Error).message
    );
    process.exit(1);
  }
};

startServer();
