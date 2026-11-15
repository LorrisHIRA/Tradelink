// Very small rate limiter: at most `max` requests per `windowMs` for each IP address.
// Used on the contact details route so bots cannot harvest phone numbers (NFR4).
function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const record = hits.get(key) || { count: 0, start: now };

    if (now - record.start > windowMs) {
      record.count = 0;
      record.start = now;
    }
    record.count += 1;
    hits.set(key, record);

    if (record.count > max)
      return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    next();
  };
}

module.exports = rateLimit;
