import "../../env";
import { generateToken } from "../lib/token";

// Usage: npm run generate-token
// Prints a JWT signed with JWT_SECRET. Use it as:  Authorization: Bearer <token>
const main = async () => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in .env");
    process.exit(1);
  }

  const token = await generateToken({ role: "admin", name: "events-admin" });
  console.log(token);
};

main().catch((error) => {
  console.error("Failed to generate token:", error.message);
  process.exit(1);
});
