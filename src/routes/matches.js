import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
  matchIdParamSchema,
} from "../validation/matches.js";
import { getMatchStatus } from "../utils/matchStatus.js";
import { matches } from "../db/schema.js";
import { db } from "../db/db.js";
import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid query.", details: parsed.error.issues });
  }

  const { sport, status, team, from, to, limit = 50, offset = 0 } =
    parsed.data;
  const safeLimit = Math.min(limit, MAX_LIMIT);

  const conditions = [];
  if (sport) conditions.push(eq(matches.sport, sport));
  if (status) conditions.push(eq(matches.status, status));
  if (team) {
    const pattern = `%${team}%`;
    conditions.push(
      or(ilike(matches.homeTeam, pattern), ilike(matches.awayTeam, pattern)),
    );
  }
  if (from) conditions.push(gte(matches.startTime, new Date(from)));
  if (to) conditions.push(lte(matches.startTime, new Date(to)));

  const where = conditions.length ? and(...conditions) : undefined;

  try {
    const total = await db.$count(matches, where);
    const matchList = await db
      .select()
      .from(matches)
      .where(where)
      .orderBy(desc(matches.createdAt))
      .limit(safeLimit)
      .offset(offset);

    res.json({ data: matchList, total, limit: safeLimit, offset });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to list matches." });
  }
});

matchRouter.get("/:id", async (req, res) => {
  const parsed = matchIdParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid match ID.", details: parsed.error.issues });
  }

  try {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, parsed.data.id))
      .limit(1);

    if (!match) {
      return res.status(404).json({ error: "Match not found." });
    }

    res.json({ data: match });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to fetch match." });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "invalid payload",
      details: parsed.error.issues,
    });
    return;
  }

  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsed;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    if (res.app.locals.broadCastMatchCreated) {
      res.app.locals.broadCastMatchCreated(event);
    }

    res.status(201).json({ data: event });
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .json({ error: "failed to create a match" });
  }
});
