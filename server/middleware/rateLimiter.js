/**
 * Simple In-Memory Rate Limiter Middleware for AI & Vision endpoints
 */
const rateLimitsMap = new Map();

/**
 * Creates a rate limiting middleware
 * @param {number} windowMs - Time window in milliseconds (e.g. 60000 for 1 minute)
 * @param {number} max - Max allowed requests per window
 * @param {string} code - Error code if limit is exceeded
 */
const createRateLimiter = (windowMs = 60000, max = 20, code = 'RATE_LIMIT_EXCEEDED') => {
  return (req, res, next) => {
    const key = req.ip || req.user?._id?.toString() || 'global';
    const now = Date.now();

    const record = rateLimitsMap.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count += 1;
    rateLimitsMap.set(key, record);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: {
          code,
          message: `Too many requests. Please try again after ${Math.ceil((record.resetTime - now) / 1000)} seconds.`,
        },
      });
    }

    next();
  };
};

const aiRateLimiter = createRateLimiter(60000, 30, 'AI_RATE_LIMIT_EXCEEDED');

module.exports = {
  createRateLimiter,
  aiRateLimiter,
};
