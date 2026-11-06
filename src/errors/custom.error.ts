import { BAD_REQUEST, CONFLICT_ERROR, DATABASE_CONNECTION_NOT_FOUND, INTERNAL_SERVER_ERROR, NOT_ACCEPTABLE, RESOURCE_NOT_FOUND, UNAUTHORIZED_ACCESS, VALIDATION_ERROR } from "../constants/general";

export class CustomError extends Error {
    statusCode: number;
    message: string;

    constructor(statusCode: number, message: string) {
      super(message);
      this.statusCode = statusCode;

      // Set the prototype explicitly to maintain instanceof behavior
      Object.setPrototypeOf(this, CustomError.prototype);
    }

    static databaseConnectionError() {
      return new CustomError(500, DATABASE_CONNECTION_NOT_FOUND);
    }

    // You can add more specific error handlers here
    static notFoundError(message: string = RESOURCE_NOT_FOUND) {
      return new CustomError(404, message);
    }

    static badRequestError(message: string = BAD_REQUEST) {
      return new CustomError(400, message);
    }

    static internalServerError() {
      return new CustomError(500, INTERNAL_SERVER_ERROR);
    }

    static conflictError(message: string = CONFLICT_ERROR) {
      return new CustomError(409, message);
    }

    static invalidResourceError(message: string = NOT_ACCEPTABLE) {
      return new CustomError(406, message);
    }

    static validationError(message: string = VALIDATION_ERROR) {
      return new CustomError(400, message);
    }

    static unAuthorizeError(message: string = UNAUTHORIZED_ACCESS) {
      return new CustomError(401, message);
    }
}
