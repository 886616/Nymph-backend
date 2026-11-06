import { Application } from "express";
import { API_PREFIX, CURRENT_VERSION, ROUTE_MEDIATOR } from "../constants/api-version";
import { eventRouter } from "./event.route";

const initRoutes = (app: Application) => {
    const baseRoute = API_PREFIX + CURRENT_VERSION + ROUTE_MEDIATOR;

    app.use(`${baseRoute}/event`, eventRouter);
};

export { initRoutes };
