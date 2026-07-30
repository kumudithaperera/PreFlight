const { createClient } = require("@supabase/supabase-js");

// Existing client, already wired to env vars - present so the agent doesn't
// need to invent project setup, just use it.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = { supabase };
