-- Loads the 6 initial events. Run it in the SQL tab of the GoDaddy database panel
-- AFTER the API has started once (the app creates the `seminar_events` table on first start
-- when DB_SYNCHRONIZE=true).
--
-- INSERT IGNORE: re-running never overwrites events that already exist (or were edited later).

INSERT IGNORE INTO seminar_events
  (id, title, days, startDate, endDate, `time`, city, country, region, venueName, venueAddress,
   currency, price, groupPrice, groupMinSize, createdBy, createdOn)
VALUES
  ('ahmedabad-29-nov-2026',
   'Financial Problems & Survival Strategies of Businesses in India',
   1, '2026-11-29', '2026-11-29', '9:00 AM – 5:00 PM', 'Ahmedabad', 'India', 'India',
   'Ahmedabad Management Association (AMA)',
   'ATIRA Campus, Dr. Vikram Sarabhai Marg, IIM Road, Vastrapur, Ahmedabad, Gujarat 380015',
   'INR', 2999, 2599, 3, 'seed', NOW()),

  ('ahmedabad-13-dec-2026',
   'Financial Problems & Survival Strategies of Businesses in India',
   1, '2026-12-13', '2026-12-13', '9:00 AM – 5:00 PM', 'Ahmedabad', 'India', 'India',
   'Ahmedabad Management Association (AMA)',
   'ATIRA Campus, Dr. Vikram Sarabhai Marg, IIM Road, Vastrapur, Ahmedabad, Gujarat 380015',
   'INR', 2999, 2599, 3, 'seed', NOW()),

  ('dubai-19-dec-2026',
   'Strategic Business Architecture & Sustainable Financial Planning',
   2, '2026-12-19', '2026-12-20', '9:30 AM – 6:15 PM', 'Dubai', 'United Arab Emirates', 'International',
   'Howard Johnson by Wyndham',
   'Khalid Bin Al Waleed Road, Al Raffa / Al Souq Al Kabeer, Bur Dubai, Dubai, United Arab Emirates',
   'USD', 449, 425, 3, 'seed', NOW()),

  ('hanoi-23-jan-2027',
   'Cash Flow, Capital & Resilience: Financial Mastery for Businessmen',
   2, '2027-01-23', '2027-01-24', '9:30 AM – 6:15 PM', 'Hanoi', 'Vietnam', 'International',
   'FTE Ba Dinh',
   '268 Buoi Street, Ngoc Ha Ward, Ba Dinh District, Hanoi, Vietnam',
   'USD', 449, 425, 3, 'seed', NOW()),

  ('malaysia-13-feb-2027',
   'Systems, Technology & Financial Mastery',
   2, '2027-02-13', '2027-02-14', '9:30 AM – 6:15 PM', 'Malaysia', 'Malaysia', 'International',
   NULL, NULL,
   'USD', 449, 425, 3, 'seed', NOW()),

  ('singapore-27-feb-2027',
   'Smart Operations & Practical AI for Modern Businesses',
   2, '2027-02-27', '2027-02-28', '9:30 AM – 6:15 PM', 'Singapore', 'Singapore', 'International',
   NULL, NULL,
   'USD', 499, 475, 3, 'seed', NOW());