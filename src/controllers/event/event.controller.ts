import { Request, Response } from 'express';
import { MoreThanOrEqual } from 'typeorm';
import { SeminarEvent } from '../../entity/common/seminar-event';
import { CustomError } from '../../errors/custom.error';
import { sendErrorResponse } from '../../errors/send-error-response.error';
import {
  DELETE_SUCCESS,
  EVENT_ALREADY_EXISTS,
  EVENT_CREATED_SUCCESS,
  EVENT_FETCHED_SUCCESS,
  EVENT_ID_REQUIRED,
  EVENT_NOT_FOUND,
  EVENT_UPDATED_SUCCESS,
  INVALID_REGION,
} from '../../constants/general';
import { EVENT_EDITABLE_FIELDS, EVENT_REGIONS } from '../../constants/event';
import { validateEventData } from '../../utils/validators/event.validator';
import { buildEventId } from '../../utils/slug';

// Trim text values so "  Dubai " and "Dubai" are stored the same way
const clean = (value: any) => (typeof value === 'string' ? value.trim() : value);

// ── CREATE EVENT ─────────────────────────────────────────────────
export const createEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dbConnection = res.locals.dbConnection;
    if (!dbConnection) {
      return sendErrorResponse(res, CustomError.databaseConnectionError());
    }

    const { id, createdBy } = req.body;

    const data: any = {};
    for (const field of EVENT_EDITABLE_FIELDS) {
      data[field] = clean(req.body[field]);
    }
    data.venueName = data.venueName ?? null;
    data.venueAddress = data.venueAddress ?? null;

    const validation = validateEventData({ ...data, id: clean(id) });
    if (!validation.isValid) {
      return sendErrorResponse(res, CustomError.validationError(validation.message));
    }

    const eventRepo = dbConnection.getRepository(SeminarEvent);

    const eventId = clean(id) || buildEventId(data.city, data.startDate);
    const existing = await eventRepo.findOne({ where: { id: eventId } });
    if (existing) {
      return sendErrorResponse(res, CustomError.conflictError(EVENT_ALREADY_EXISTS));
    }

    const event = eventRepo.create({
      id: eventId,
      ...data,
      createdBy: createdBy ?? null,
      createdOn: new Date(),
    });

    const saved = await eventRepo.save(event);

    return res.status(201).json({
      status: true,
      message: EVENT_CREATED_SUCCESS,
      data: saved,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return sendErrorResponse(res, CustomError.internalServerError());
  }
};

// ── GET ALL EVENTS ───────────────────────────────────────────────
// Query (all optional): id, region (India | International), upcoming (true), offset, limit
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dbConnection = res.locals.dbConnection;
    if (!dbConnection) {
      return sendErrorResponse(res, CustomError.databaseConnectionError());
    }

    const { id, region, upcoming, offset = 0, limit = 100 } = req.query;
    const eventRepo = dbConnection.getRepository(SeminarEvent);

    const where: any = {};

    if (id) {
      where.id = String(id);
    }

    if (region) {
      if (!(EVENT_REGIONS as readonly string[]).includes(String(region))) {
        return sendErrorResponse(res, CustomError.badRequestError(INVALID_REGION));
      }
      where.region = String(region);
    }

    if (String(upcoming) === "true") {
      where.startDate = MoreThanOrEqual(new Date().toISOString().slice(0, 10));
    }

    const skip = Math.max(parseInt(offset as string) || 0, 0);
    const take = Math.min(parseInt(limit as string) || 100, 500);

    const [events, totalCount] = await eventRepo.findAndCount({
      where,
      order: { startDate: "ASC", id: "ASC" },
      skip,
      take,
    });

    return res.status(200).json({
      status: true,
      message: EVENT_FETCHED_SUCCESS,
      totalCount,
      offset: skip,
      limit: take,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return sendErrorResponse(res, CustomError.internalServerError());
  }
};

// ── UPDATE EVENT ─────────────────────────────────────────────────
// Body: { id, ...any editable fields, modifiedBy }. Send only the fields that change.
export const updateEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dbConnection = res.locals.dbConnection;
    if (!dbConnection) {
      return sendErrorResponse(res, CustomError.databaseConnectionError());
    }

    const { id, modifiedBy } = req.body;
    if (!id) {
      return sendErrorResponse(res, CustomError.badRequestError(EVENT_ID_REQUIRED));
    }

    const eventRepo = dbConnection.getRepository(SeminarEvent);
    const event = await eventRepo.findOne({ where: { id: String(id) } });

    if (!event) {
      return sendErrorResponse(res, CustomError.notFoundError(EVENT_NOT_FOUND));
    }

    // Stored values overridden by whatever was sent, then validated as a whole
    const merged: any = {};
    for (const field of EVENT_EDITABLE_FIELDS) {
      merged[field] = req.body[field] !== undefined ? clean(req.body[field]) : event[field];
    }

    const validation = validateEventData(merged);
    if (!validation.isValid) {
      return sendErrorResponse(res, CustomError.validationError(validation.message));
    }

    Object.assign(event, merged);
    if (modifiedBy) event.modifiedBy = modifiedBy;
    event.modifiedOn = new Date();

    const updated = await eventRepo.save(event);

    return res.status(200).json({
      status: true,
      message: EVENT_UPDATED_SUCCESS,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return sendErrorResponse(res, CustomError.internalServerError());
  }
};

// ── DELETE EVENT ─────────────────────────────────────────────────
export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const dbConnection = res.locals.dbConnection;
    if (!dbConnection) {
      return sendErrorResponse(res, CustomError.databaseConnectionError());
    }

    const { id } = req.query;
    if (!id) {
      return sendErrorResponse(res, CustomError.badRequestError(EVENT_ID_REQUIRED));
    }

    const eventRepo = dbConnection.getRepository(SeminarEvent);
    const event = await eventRepo.findOne({ where: { id: String(id) } });

    if (!event) {
      return sendErrorResponse(res, CustomError.notFoundError(EVENT_NOT_FOUND));
    }

    await eventRepo.remove(event);

    return res.status(200).json({
      status: true,
      message: DELETE_SUCCESS,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return sendErrorResponse(res, CustomError.internalServerError());
  }
};
