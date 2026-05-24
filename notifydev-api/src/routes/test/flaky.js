import express from "express";

/** In-memory hit counts per key (resets when API container restarts). */
const hits = new Map();

const flakyRouter = express.Router();

/**
 * Dev-only: returns 500 for the first `failCount` requests, then 200.
 * Use from the worker as: http://notifydev-api:8000/v1/api/test/flaky?failCount=5&key=my-test
 */
flakyRouter.get("/flaky", (req, res) => {
  const failCount = Math.max(1, Number(req.query.failCount) || 5);
  const key = String(req.query.key || "default");

  const attempt = (hits.get(key) ?? 0) + 1;
  hits.set(key, attempt);

  const body = { key, attempt, failCount, phase: attempt <= failCount ? "down" : "up" };

  if (attempt <= failCount) {
    return res.status(500).json({ ...body, ok: false, msg: "Simulated failure" });
  }

  return res.status(200).json({ ...body, ok: true, msg: "Simulated success" });
});

/** Reset counter so you can run the down→up test again. */
flakyRouter.post("/flaky/reset", (req, res) => {
  const key = String(req.query.key || req.body?.key || "default");
  hits.delete(key);
  return res.json({ ok: true, msg: `Counter reset for key "${key}"` });
});

export default flakyRouter;
