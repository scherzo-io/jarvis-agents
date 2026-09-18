const ALLOWED_METHODS = "GET, POST, OPTIONS";
const ALLOWED_HEADERS = "Content-Type, Authorization, X-Requested-With";

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return true;
  }

  try {
    const { protocol, hostname } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") {
      return false;
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    if (hostname === "vercel.app" || hostname.endsWith(".vercel.app")) {
      return true;
    }

    // v0: open enough for any Jarvis HUD origin.
    return true;
  } catch {
    return false;
  }
}

export function corsHeaders(request?: Request): Headers {
  const headers = new Headers();
  const origin = request?.headers.get("origin");

  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    headers.set("Access-Control-Allow-Origin", "*");
  }

  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  headers.set("Access-Control-Max-Age", "86400");
  return headers;
}

export function optionsResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
