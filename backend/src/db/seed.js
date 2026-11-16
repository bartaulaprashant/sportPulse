import { hashPassword } from "../auth.js";
import { admins } from "./schema.js";
import { db, pool } from "./db.js";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding.");
  process.exit(1);
}

const passwordHash = hashPassword(password);

const [admin] = await db
  .insert(admins)
  .values({ email, passwordHash })
  .onConflictDoNothing({ target: admins.email })
  .returning();

if (admin) {
  console.log(`Admin created: ${admin.email} (id ${admin.id})`);
} else {
  console.log(`Admin already exists: ${email}`);
}

await pool.end();