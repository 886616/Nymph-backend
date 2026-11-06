import { ValueTransformer } from "typeorm";
import { format, fromZonedTime, toZonedTime } from "date-fns-tz";

const TARGET_TIMEZONE = "Australia/Sydney";
const DISPLAY_FORMAT = "yyyy-MM-dd HH:mm:ss";

export const SydneyTimeDisplayTransformer: ValueTransformer = {
  from(dbValue: Date | string | null): string | null {
    if (!dbValue) {
      return null;
    }

    // Handle MySQL zero dates or empty strings
    if (dbValue === "0000-00-00 00:00:00" || dbValue === "" || dbValue === null) {
      return null;
    }

    let date: Date;

    // Normalize input to Date
    if (dbValue instanceof Date) {
      date = dbValue;
    } else {
      date = new Date(dbValue);
    }

    if (isNaN(date.getTime())) {
      // Invalid date string or number
      return null;
    }

    const zonedDate = toZonedTime(date, TARGET_TIMEZONE);
    return format(zonedDate, DISPLAY_FORMAT, { timeZone: TARGET_TIMEZONE });
  },

  to(entityValue: string | Date | null): Date | null {
    if (!entityValue) {
      return null;
    }

    if (typeof entityValue === "string") {
      if (entityValue === "0000-00-00 00:00:00" || entityValue.trim() === "") {
        return null;
      }
      return fromZonedTime(entityValue, TARGET_TIMEZONE);
    }

    return entityValue instanceof Date && !isNaN(entityValue.getTime())
      ? entityValue
      : null;
  },
};
