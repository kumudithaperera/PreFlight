// Fake auth middleware for eval fixtures. Reads a `Bearer <userId>` token and
// sets req.user - stands in for a real session/JWT check that already exists.

const { users } = require("../db");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (\d+)$/);
  if (!match) return res.status(401).json({ error: "unauthorized" });
  const user = users.find((u) => u.id === Number(match[1]));
  if (!user) return res.status(401).json({ error: "unauthorized" });
  req.user = user;
  next();
}

module.exports = { requireAuth };
