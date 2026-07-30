const express = require("express");
const app = express();
app.use(express.json());

// Existing routes are mounted here. Add new route files under src/routes/
// and require+use them the same way.

module.exports = app;
