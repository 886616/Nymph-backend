export const EVENT_REGIONS = ["India", "International"] as const;
export const EVENT_CURRENCIES = ["INR", "USD"] as const;

export type EventRegion = (typeof EVENT_REGIONS)[number];
export type EventCurrency = (typeof EVENT_CURRENCIES)[number];

// Fields an admin can create / edit (id and audit columns are handled separately)
export const EVENT_EDITABLE_FIELDS = [
  "title",
  "days",
  "startDate",
  "endDate",
  "time",
  "city",
  "country",
  "region",
  "venueName",
  "venueAddress",
  "currency",
  "price",
  "groupPrice",
  "groupMinSize",
] as const;
