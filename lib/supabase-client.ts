import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/social";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
  "";

export const supabaseConfig = {
  hasUrl: Boolean(supabaseUrl),
  hasPublishableKey: Boolean(supabasePublishableKey),
};

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return null;
  }

  browserClient ??= createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return browserClient;
}
