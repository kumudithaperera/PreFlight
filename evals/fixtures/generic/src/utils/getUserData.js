const { users } = require("../db");

// Used by src/routes/profile.js and src/routes/admin.js.
function getUserData(userId) {
  return users.find((u) => u.id === userId) || null;
}

module.exports = { getUserData };
