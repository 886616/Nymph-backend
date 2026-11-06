const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// ("Ahmedabad", "2026-11-29") -> "ahmedabad-29-nov-2026"  (same format as the frontend ids)
export const buildEventId = (city: string, startDate: string): string => {
  const [year, month, day] = startDate.split("-");
  const citySlug = city
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${citySlug}-${Number(day)}-${MONTHS[Number(month) - 1]}-${year}`;
};
