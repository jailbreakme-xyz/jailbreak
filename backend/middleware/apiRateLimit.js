import { Breaker } from "../models/Models.js";

async function apiRateLimit(req, res, next) {
  const token = req.headers["x-api-key"];
  if (!token) return next();

  try {
    const limit = 5000;
    const breaker = await Breaker.findOne({ api_key: token });
    if (!breaker) return next();

    const now = new Date();
    const hourAgo = new Date(now - 60 * 60 * 1000);
    const count = breaker.api_rate_limit.count;

    res.setHeader("X-RateLimit-Limit", limit);

    // Initialize or reset rate limit if expired
    if (!count || breaker.api_rate_limit.date < hourAgo) {
      breaker.api_rate_limit = {
        count: 1,
        date: now,
      };

      res.setHeader("X-RateLimit-Remaining", limit - 1);
      res.setHeader(
        "X-RateLimit-Reset",
        breaker.api_rate_limit.date.getTime() + 3600000
      );

      await breaker.save();
      return next();
    }

    const nextCount = count + 1;
    const remaining = limit - nextCount < 0 ? 0 : limit - nextCount;
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader(
      "X-RateLimit-Reset",
      breaker.api_rate_limit.date.getTime() + 3600000
    );

    // Increment count if within the same hour
    if (count >= limit) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        details: `API rate limit is ${limit} requests per hour`,
      });
    }

    breaker.api_rate_limit.count += 1;
    await breaker.save();

    next();
  } catch (error) {
    console.error("Rate Limit Error:", error);
    next(error);
  }
}

export default apiRateLimit;
