import { optionsResponse } from "@/lib/cors";
import { jsonResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return jsonResponse(
    {
      ok: true,
      service: "jarvis-agents",
      project: "jarvis-agents-that-execute-au",
      endpoints: {
        health: "GET /api/health",
        control: "POST /api/control",
        lastControl: "GET /api/control",
      },
    },
    { request },
  );
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
