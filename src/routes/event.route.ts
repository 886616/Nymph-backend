import express, { Request, Response } from "express";
import * as eventController from "../controllers/event/event.controller";
import { authorize } from "../lib/authorize";

const router = express.Router();

// Public: used by the website
router.get("/get-events", (req: Request, res: Response) => {
    eventController.getAllEvents(req, res);
});

// Admin only (Bearer token)
router.post("/create-event", authorize, (req: Request, res: Response) => {
    eventController.createEvent(req, res);
});

router.put("/update-event", authorize, (req: Request, res: Response) => {
    eventController.updateEvent(req, res);
});

router.delete("/delete-event", authorize, (req: Request, res: Response) => {
    eventController.deleteEvent(req, res);
});

export const eventRouter = router;
