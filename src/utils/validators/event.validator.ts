import { EVENT_CURRENCIES, EVENT_REGIONS } from "../../constants/event";

type ValidationResult = { isValid: boolean; message?: string };

const isRealDate = (value: any): boolean => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

const isNonEmptyString = (value: any, max: number): boolean =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;

const isMoney = (value: any): boolean =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 99999999;

// Validates a complete event payload (create body, or stored event merged with an update body)
export const validateEventData = (data: any): ValidationResult => {
  if (data.id !== undefined && data.id !== null) {
    if (typeof data.id !== "string" || data.id.length > 120 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.id)) {
      return { isValid: false, message: "id must contain only lowercase letters, numbers and hyphens (max 120 chars)" };
    }
  }

  if (!isNonEmptyString(data.title, 255)) {
    return { isValid: false, message: "title is required (max 255 characters)" };
  }

  if (data.days !== 1 && data.days !== 2) {
    return { isValid: false, message: "days must be 1 or 2" };
  }

  if (!isRealDate(data.startDate)) {
    return { isValid: false, message: "startDate is required in YYYY-MM-DD format" };
  }
  if (!isRealDate(data.endDate)) {
    return { isValid: false, message: "endDate is required in YYYY-MM-DD format" };
  }
  if (data.endDate < data.startDate) {
    return { isValid: false, message: "endDate cannot be before startDate" };
  }
  if (data.days === 1 && data.endDate !== data.startDate) {
    return { isValid: false, message: "endDate must be the same as startDate for a 1-day event" };
  }
  if (data.days === 2 && data.endDate === data.startDate) {
    return { isValid: false, message: "endDate must be after startDate for a 2-day event" };
  }

  if (!isNonEmptyString(data.time, 50)) {
    return { isValid: false, message: "time is required (max 50 characters)" };
  }
  if (!isNonEmptyString(data.city, 100)) {
    return { isValid: false, message: "city is required (max 100 characters)" };
  }
  if (!isNonEmptyString(data.country, 100)) {
    return { isValid: false, message: "country is required (max 100 characters)" };
  }

  if (!(EVENT_REGIONS as readonly string[]).includes(data.region)) {
    return { isValid: false, message: `region must be one of: ${EVENT_REGIONS.join(", ")}` };
  }

  // venueName / venueAddress are optional: null or a non-empty string
  if (data.venueName != null && !isNonEmptyString(data.venueName, 255)) {
    return { isValid: false, message: "venueName must be null or a non-empty string (max 255 characters)" };
  }
  if (data.venueAddress != null && !isNonEmptyString(data.venueAddress, 500)) {
    return { isValid: false, message: "venueAddress must be null or a non-empty string (max 500 characters)" };
  }

  if (!(EVENT_CURRENCIES as readonly string[]).includes(data.currency)) {
    return { isValid: false, message: `currency must be one of: ${EVENT_CURRENCIES.join(", ")}` };
  }

  if (!isMoney(data.price)) {
    return { isValid: false, message: "price must be a number greater than or equal to 0" };
  }
  if (!isMoney(data.groupPrice)) {
    return { isValid: false, message: "groupPrice must be a number greater than or equal to 0" };
  }
  if (data.groupPrice > data.price) {
    return { isValid: false, message: "groupPrice cannot be higher than price" };
  }

  if (!Number.isInteger(data.groupMinSize) || data.groupMinSize < 2 || data.groupMinSize > 1000) {
    return { isValid: false, message: "groupMinSize must be a whole number of at least 2" };
  }

  return { isValid: true };
};
