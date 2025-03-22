const { createClient } = require("@supabase/supabase-js");
const serviceAccount = require("../superbase-key.json");

// Ensure you use the correct keys from JSON
const supabase = createClient(
  serviceAccount.apiUrl,
  serviceAccount.serviceRoleKey
);

module.exports = supabase;
