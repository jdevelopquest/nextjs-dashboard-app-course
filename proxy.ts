import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Proxy logic goes here
  if (request.nextUrl.pathname.startsWith("/auth/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
