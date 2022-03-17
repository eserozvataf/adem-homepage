import redis from "lib/redis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const method = req.method;
  const { id } = req.query;

  try {
    if (method === "GET") {
      const count = await redis.get(`bookmark:${id}`);
      return res.status(200).json({ count });
    }

    if (method === "PATCH") {
      const ip =
        req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || "NA";

      let response = 1;

      if (ip !== "NA") {
        const key = `bookmark:${id}`;
        response = await redis.sadd(key, ip);
      }

      if (response === 0) {
        return res.status(200).json({ message: "Already voted" });
      }

      const count = await redis.incr(`bookmark:${id}`);
      return res.status(200).json({ count });
    }

    return res.status(400).json({ message: "Method not allowed" });
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
}