import { Router } from "express";
import { eq } from "drizzle-orm";
import { loginSchema } from "../validation/auth.js";
import { signAdminToken, verifyPassword } from "../auth.js";
import { admins } from "../db/schema.js";
import { db } from "../db/db.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid login payload.",
      details: parsed.error.issues,
    });
  }

  const { email, password } = parsed.data;

  try {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email.toLowerCase()))
      .limit(1);

    // Verify against a dummy hash when the admin doesn't exist so the
    // response time doesn't reveal whether the email is registered.
    const storedHash =
      admin?.passwordHash ??
      "00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    if (!verifyPassword(password, storedHash) || !admin) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signAdminToken(admin);
    res.json({
      data: {
        token,
        admin: { id: admin.id, email: admin.email },
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

// Admin self-registration is disabled; admins are created via the seed script.
