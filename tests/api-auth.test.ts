import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../lib/api-auth";
import { NextRequest } from "next/server";

describe("Rate Limiter (checkRateLimit)", () => {
  it("should allow requests under the limit within the window", () => {
    const req = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    
    // First request should succeed
    const res1 = checkRateLimit(req, 2, 5000);
    expect(res1.success).toBe(true);
    
    // Second request should succeed
    const res2 = checkRateLimit(req, 2, 5000);
    expect(res2.success).toBe(true);
  });

  it("should block requests that exceed the limit within the window", () => {
    const req = new NextRequest("http://localhost/api/test", {
      headers: { "x-forwarded-for": "5.6.7.8" },
    });
    
    // First request should succeed
    const res1 = checkRateLimit(req, 1, 5000);
    expect(res1.success).toBe(true);
    
    // Second request should fail (exceeds limit of 1)
    const res2 = checkRateLimit(req, 1, 5000);
    expect(res2.success).toBe(false);
  });
});
