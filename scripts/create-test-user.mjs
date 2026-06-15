// Run with: node scripts/create-test-user.mjs
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bprouycmtthhibemguwn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_eegveRv-Ij80RoNJG2SeHg_15Bt2vRK";

const TEST_EMAIL = "admin@example.com";
const TEST_PASSWORD = "admin123";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { data, error } = await supabase.auth.signUp({
  email: TEST_EMAIL,
  password: TEST_PASSWORD,
});

if (error) {
  console.error("Error:", error.message);
  process.exit(1);
}

console.log("Test user created successfully!");
console.log("Email   :", TEST_EMAIL);
console.log("Password:", TEST_PASSWORD);
console.log("");
if (data.session) {
  console.log("User is ready to log in immediately.");
} else {
  console.log("NOTE: Cek inbox email untuk konfirmasi, atau disable email confirmation di Supabase dashboard:");
  console.log("  Authentication → Providers → Email → Confirm email (toggle off)");
}
