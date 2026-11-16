import "dotenv/config";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const SCRYPT_KEYLEN = 64;
const JWT_EXPIRES_IN = "12h";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined");
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .scryptSync(password, salt, SCRYPT_KEYLEN)
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const candidate = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length &&
    crypto.timingSafeEqual(candidate, expected)
  );
}

export function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email }, jwtSecret, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token." });
  }

  try {
    req.admin = jwt.verify(header.slice(7), jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
