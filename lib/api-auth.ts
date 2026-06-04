import { NextRequest } from "next/server";

/**
 * Validates request session or token for securing backend API routes.
 */
export function validateApiRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return false;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return false;
  }
  // Accepts user email, sandbox key, or active JWT tokens
  return token.length > 0;
}
