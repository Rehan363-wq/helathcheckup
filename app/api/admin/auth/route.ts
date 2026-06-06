import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json({ authenticated: false, error: "Password is required" }, { status: 400 });
    }

    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error("ADMIN_SECRET is not configured on the server.");
      return Response.json({ authenticated: false, error: "Server authentication misconfigured" }, { status: 500 });
    }

    if (password === adminSecret) {
      return Response.json({ authenticated: true });
    } else {
      return Response.json({ authenticated: false, error: "Incorrect password" }, { status: 401 });
    }
  } catch (error) {
    console.error("Admin Authentication API error:", error);
    return Response.json({ authenticated: false, error: "Internal server error" }, { status: 500 });
  }
}
