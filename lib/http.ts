import { NextResponse } from "next/server";
import { corsHeaders } from "./cors";

export function jsonResponse(
  data: unknown,
  init: { status?: number; request?: Request; headers?: HeadersInit } = {},
): NextResponse {
  const response = NextResponse.json(data, { status: init.status ?? 200 });
  corsHeaders(init.request).forEach((value, key) => {
    response.headers.set(key, value);
  });

  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => {
      response.headers.set(key, value);
    });
  }

  return response;
}
