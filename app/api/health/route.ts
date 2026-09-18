import { optionsResponse } from "@/lib/cors";
import { jsonResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return jsonResponse(
    {
      ok: true,
      service: "jarvis-agents",
    },
    { request },
  );
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
