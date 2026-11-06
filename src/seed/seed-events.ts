import "reflect-metadata";
import "../../env";
import { getDatabaseConnection } from "../db/db";
import { SeminarEvent } from "../entity/common/seminar-event";

const AMA_VENUE = {
  venueName: "Ahmedabad Management Association (AMA)",
  venueAddress:
    "ATIRA Campus, Dr. Vikram Sarabhai Marg, IIM Road, Vastrapur, Ahmedabad, Gujarat 380015",
};

const events: Partial<SeminarEvent>[] = [
  {
    id: "ahmedabad-29-nov-2026",
    title: "Financial Problems & Survival Strategies of Businesses in India",
    days: 1,
    startDate: "2026-11-29",
    endDate: "2026-11-29",
    time: "9:00 AM – 5:00 PM",
    city: "Ahmedabad",
    country: "India",
    region: "India",
    ...AMA_VENUE,
    currency: "INR",
    price: 2999,
    groupPrice: 2599,
    groupMinSize: 3,
  },
  {
    id: "ahmedabad-13-dec-2026",
    title: "Financial Problems & Survival Strategies of Businesses in India",
    days: 1,
    startDate: "2026-12-13",
    endDate: "2026-12-13",
    time: "9:00 AM – 5:00 PM",
    city: "Ahmedabad",
    country: "India",
    region: "India",
    ...AMA_VENUE,
    currency: "INR",
    price: 2999,
    groupPrice: 2599,
    groupMinSize: 3,
  },
  {
    id: "dubai-19-dec-2026",
    title: "Strategic Business Architecture & Sustainable Financial Planning",
    days: 2,
    startDate: "2026-12-19",
    endDate: "2026-12-20",
    time: "9:30 AM – 6:15 PM",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "International",
    venueName: "Howard Johnson by Wyndham",
    venueAddress:
      "Khalid Bin Al Waleed Road, Al Raffa / Al Souq Al Kabeer, Bur Dubai, Dubai, United Arab Emirates",
    currency: "USD",
    price: 449,
    groupPrice: 425,
    groupMinSize: 3,
  },
  {
    id: "hanoi-23-jan-2027",
    title: "Cash Flow, Capital & Resilience: Financial Mastery for Businessmen",
    days: 2,
    startDate: "2027-01-23",
    endDate: "2027-01-24",
    time: "9:30 AM – 6:15 PM",
    city: "Hanoi",
    country: "Vietnam",
    region: "International",
    venueName: "FTE Ba Dinh",
    venueAddress: "268 Buoi Street, Ngoc Ha Ward, Ba Dinh District, Hanoi, Vietnam",
    currency: "USD",
    price: 449,
    groupPrice: 425,
    groupMinSize: 3,
  },
  {
    id: "malaysia-13-feb-2027",
    title: "Systems, Technology & Financial Mastery",
    days: 2,
    startDate: "2027-02-13",
    endDate: "2027-02-14",
    time: "9:30 AM – 6:15 PM",
    city: "Malaysia",
    country: "Malaysia",
    region: "International",
    venueName: null,
    venueAddress: null,
    currency: "USD",
    price: 449,
    groupPrice: 425,
    groupMinSize: 3,
  },
  {
    id: "singapore-27-feb-2027",
    title: "Smart Operations & Practical AI for Modern Businesses",
    days: 2,
    startDate: "2027-02-27",
    endDate: "2027-02-28",
    time: "9:30 AM – 6:15 PM",
    city: "Singapore",
    country: "Singapore",
    region: "International",
    venueName: null,
    venueAddress: null,
    currency: "USD",
    price: 499,
    groupPrice: 475,
    groupMinSize: 3,
  },
];

const seed = async () => {
  const dbConnection = await getDatabaseConnection(process.env.EVENTS_DOMAIN);
  const eventRepo = dbConnection.getRepository(SeminarEvent);

  // save() inserts new rows and updates existing ones by id, so re-running is safe
  // createdOn is set explicitly because db.ts maps datetime columns through the Sydney transformer
  await eventRepo.save(events.map((event) => ({ ...event, createdBy: "seed", createdOn: new Date() })));

  console.log(`Seeded ${events.length} events`);
  await dbConnection.destroy();
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
