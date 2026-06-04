import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    return createBrowserClient(url, key);
  } catch (e) {
    console.warn("Failed to create Supabase client:", e);
    return null;
  }
}
