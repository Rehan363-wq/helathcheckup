import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Validates request session or token for securing backend API routes.
 */
export async function validateApiRequest(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return false;
  }

  // 1. Validate Supabase JWT token if it follows JWT format
  if (token.split(".").length === 3) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          return true;
        }
      } catch (e) {
        console.warn("Supabase JWT validation failed:", e);
      }
    }
  }

  // 2. Validate sandbox or demo mode session keys (email address or "sandbox")
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (token === "sandbox" || emailRegex.test(token)) {
    return true;
  }

  return false;
}

const rateLimitMap = new Map<string, number[]>();

/**
 * Checks if the client has exceeded the API request limit.
 */
export function checkRateLimit(request: NextRequest, limit: number = 15, windowMs: number = 60000): { success: boolean } {
  const ip = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return { success: true };
  }
  
  const timestamps = rateLimitMap.get(ip)!;
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  
  if (validTimestamps.length >= limit) {
    return { success: false };
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return { success: true };
}
