import { optionsResponse } from "@/lib/cors";
import { parseControlEvent, readJsonBody } from "@/lib/control-event";
import { getLastControlEvent, storeControlEvent } from "@/lib/control-store";
import { jsonResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const stored = getLastControlEvent();

  return jsonResponse(
    {
      ok: true,
      event: stored?.event ?? null,
      storedAt: stored?.storedAt ?? null,
    },
    {
      request,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function POST(request: Request) {
  const parsedBody = await readJsonBody(request);
  if (!parsedBody.ok) {
    return jsonResponse(parsedBody, { status: 400, request });
  }

  const parsedEvent = parseControlEvent(parsedBody.body);
  if (!parsedEvent.ok) {
    return jsonResponse(parsedEvent, { status: 400, request });
  }

  const stored = storeControlEvent(parsedEvent.event);

  return jsonResponse(
    {
      ok: true,
      accepted: true,
      event: stored.event,
      storedAt: stored.storedAt,
    },
    {
      request,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function OPTIONS(request: Request) {
  return optionsResponse(request);
}
