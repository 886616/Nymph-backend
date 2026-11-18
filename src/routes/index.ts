import { Application } from "express";
import { API_PREFIX, CURRENT_VERSION, ROUTE_MEDIATOR } from "../constants/api-version";
import { eventRouter } from "./event.route";
import { registrationRouter } from "./registration.route";
import { contactRouter } from "./contact.route";

const initRoutes = (app: Application) => {
    const baseRoute = API_PREFIX + CURRENT_VERSION + ROUTE_MEDIATOR;

    app.use(`${baseRoute}/event`, eventRouter);
    app.use(`${baseRoute}/registration`, registrationRouter);
    app.use(`${baseRoute}/contact`, contactRouter);
};

export { initRoutes };