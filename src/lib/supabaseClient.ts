import { createClient } from "@supabase/supabase-js";

// Read environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project-id.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Supabase env variables are missing! Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Vercel dashboard."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
