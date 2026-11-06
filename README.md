# Events Backend

Node.js + Express + TypeORM + MySQL API for seminar events (CRUD). Built with the same structure and conventions as the Mystery Management project (ESM + tsx, `getDatabaseConnection(domain)`, `res.locals.dbConnection`, `CustomError` / `sendErrorResponse`, JWT `authorize`, `{ status, message, data }` responses).

Razorpay is intentionally **not** included. It will be added manually.

## Setup

```bash
npm install
cp .env.example .env      # fill in DB credentials and JWT_SECRET
# create the database once:
#   CREATE DATABASE events_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
npm run dev               # nodemon + tsx (local development)
npm start                 # production start (tsx, no watcher) (DB_SYNCHRONIZE=true creates the table on first run)
npm run seed              # optional: loads the 6 events from the frontend (safe to re-run)
npm run generate-token    # prints an admin JWT for the create / update / delete APIs
npm run typecheck
```

> **Domain-based DB config:** like the other projects, the database is picked from the request hostname.
> `EVENTS_DOMAIN` must match the hostname the API is called on (`localhost` for local dev, the API domain in production),
> otherwise the API returns "Database connection failed".
> Keep `DB_SYNCHRONIZE=false` in production.

## API

Base path: `/api/v1/manage/event`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/get-events` | public | List events sorted by startDate. Optional query: `id`, `region` (`India` / `International`), `upcoming=true`, `offset`, `limit` (default 100, max 500) |
| POST | `/create-event` | Bearer token | Create an event (`id` optional, auto-generated like `ahmedabad-29-nov-2026`) |
| PUT | `/update-event` | Bearer token | Update an event. Body needs `id`; send only the fields that change |
| DELETE | `/delete-event?id=...` | Bearer token | Delete an event |

Protected APIs need `Authorization: Bearer <token>` (JWT signed with `JWT_SECRET`, create one with `npm run generate-token`).

### Response format

```json
{
  "status": true,
  "message": "Events fetched successfully",
  "totalCount": 6, "offset": 0, "limit": 100,
  "data": [ { "id": "ahmedabad-29-nov-2026", "title": "...", "days": 1, "startDate": "2026-11-29",
              "endDate": "2026-11-29", "time": "9:00 AM – 5:00 PM", "city": "Ahmedabad", "country": "India",
              "region": "India", "venueName": "...", "venueAddress": "...", "currency": "INR",
              "price": 2999, "groupPrice": 2599, "groupMinSize": 3 } ]
}
```

`data` items match the frontend `SeminarEvent` type (plus audit fields `createdBy`, `createdOn`, `modifiedBy`, `modifiedOn`).
Errors: `{ "status": false, "message": "..." }` with 400 (validation), 401 (token), 404, 409 (duplicate id).

### Create example

```bash
curl -X POST http://localhost:4000/api/v1/manage/event/create-event \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Smart Operations","days":2,"startDate":"2027-03-13","endDate":"2027-03-14",
       "time":"9:30 AM – 6:15 PM","city":"Singapore","country":"Singapore","region":"International",
       "venueName":null,"venueAddress":null,"currency":"USD","price":499,"groupPrice":475,"groupMinSize":3,
       "createdBy":"admin"}'
```

### Validation rules

- `days` is 1 or 2. A 1-day event needs `endDate == startDate`, a 2-day event needs `endDate > startDate`
- Dates are real calendar dates in `YYYY-MM-DD`
- `region`: `India | International`, `currency`: `INR | USD`
- `price` / `groupPrice` are numbers (not strings), `groupPrice <= price`, `groupMinSize` is a whole number >= 2
- `venueName` / `venueAddress`: `null` or a non-empty string (send `null` to clear)
- On update the stored event is merged with the body and the whole result is re-validated

## Structure

```
env.ts                         dotenv loader (imported as "../env")
src/
  index.ts                     app bootstrap
  logger.ts                    winston daily-rotate logger
  routes/                      index.ts (initRoutes) + event.route.ts
  controllers/event/           event.controller.ts
  entity/common/               seminar-event.ts
  db/                          db.ts (getDatabaseConnection) + events/index.entity.ts
  middlewares/                 databaseMiddleware, requestLogger
  lib/                         authorize (JWT), token
  errors/                      custom.error, send-error-response.error
  constants/                   general, event, api-version
  utils/                       slug, sydneyTimeDisplayTransformer, validators/event.validator
  seed/                        seed-events.ts
  scripts/                     generate-token.ts
```

## Deploy on GoDaddy Node.js hosting (Economy plan = 1 published app)

1. **Create the app**: GoDaddy account -> Web Hosting -> Node.js -> new app. Pick the region before the first deploy (North America or Europe only).
2. **Upload**: zip of this folder without `node_modules` (lockfile and `.npmrc` included), or connect the GitHub repo for auto-deploy on push.
   The project already meets GoDaddy's packaging rules: `main`, `build` and `start` scripts exist, `tsx` is in `dependencies`, and the server listens on `process.env.PORT`.
3. **Database**: create/attach the app's managed MySQL database and note its host, port, name, user and password.
4. **Environment variables** (app settings / `.env` upload):
   ```
   NODE_ENV=production
   DB_TYPE=mysql
   DB_PORT=<from GoDaddy>
   EVENTS_DOMAIN=<your API hostname, e.g. api.yourdomain.com>
   EVENTS_DB_HOST=<from GoDaddy>
   EVENTS_DB_USER_NAME=<from GoDaddy>
   EVENTS_DB_PASSWORD=<from GoDaddy>
   EVENTS_DB_DATABASE_NAME=<from GoDaddy>
   JWT_SECRET=<long random string, e.g. openssl rand -hex 32>
   CORS_ORIGINS=https://yourdomain.com
   DB_SYNCHRONIZE=true        # first deploy only, then set to false
   ```
   Do not set `PORT`; GoDaddy provides it. Any hostname resolves to this single database, so `EVENTS_DOMAIN` only needs to be non-empty.
5. **First start** creates the `seminar_events` table. Then set `DB_SYNCHRONIZE=false` and redeploy/restart.
6. **Load the events**: open the database panel -> SQL tab -> paste `seed.sql` -> run (safe to re-run, uses `INSERT IGNORE`).
7. **Domain**: connect your GoDaddy domain/subdomain to the app (one click for a GoDaddy-registered domain). SSL is automatic.
8. **Test**: `GET https://<your-api-host>/api/v1/manage/event/get-events` returns the 6 events.
9. **Admin token** for create/update/delete: run `npm run generate-token` locally with the same `JWT_SECRET` as production.

Limits to know: outbound traffic is only HTTP/HTTPS and GoDaddy's managed MySQL, console logs only (set `LOG_TO_FILE=true` to also write files), files that must persist go in `/public/assets/`.

## Razorpay (to add later)

Add `orders` / `payments` entities that reference `seminar_events.id`, register them in `db/events/index.entity.ts`,
and add a new `routes/*.route.ts` mounted in `routes/index.ts`. Once bookings exist, avoid hard-deleting events
(switch `delete-event` to an `isActive` flag).
