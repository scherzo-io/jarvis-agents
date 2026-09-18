export const MAX_CONTROL_BODY_BYTES = 16 * 1024;
export const MAX_FIELD_LENGTH = 128;

export const CONTROL_SOURCES = [
  "streamdeck",
  "hud",
  "agent",
  "unknown",
] as const;

export type ControlSource = (typeof CONTROL_SOURCES)[number];

export type ControlEvent = {
  type: string;
  source: ControlSource;
  action?: string;
  id?: string;
  payload?: Record<string, unknown>;
};

export type ControlEventError = {
  ok: false;
  error: "invalid_json" | "invalid_body" | "missing_type" | "invalid_field";
  message: string;
};

export type ControlEventSuccess = {
  ok: true;
  event: ControlEvent;
};

export type ControlEventResult = ControlEventSuccess | ControlEventError;

const STREAMDECK_PASSTHROUGH = ["context", "device", "deviceName"] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(
  value: unknown,
  field: string,
): string | undefined | ControlEventError {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return {
      ok: false,
      error: "invalid_field",
      message: `${field} must be a string`,
    };
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      error: "invalid_field",
      message: `${field} must not be empty`,
    };
  }

  if (trimmed.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: "invalid_field",
      message: `${field} must be at most ${MAX_FIELD_LENGTH} characters`,
    };
  }

  return trimmed;
}

function parseSource(value: unknown): ControlSource | ControlEventError {
  if (value === undefined) {
    return "unknown";
  }

  if (typeof value !== "string") {
    return {
      ok: false,
      error: "invalid_field",
      message: "source must be a string",
    };
  }

  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, "-");

  switch (normalized) {
    case "streamdeck":
    case "stream-deck":
      return "streamdeck";
    case "hud":
      return "hud";
    case "agent":
      return "agent";
    case "unknown":
      return "unknown";
    default:
      return {
        ok: false,
        error: "invalid_field",
        message: `unsupported source: ${value}`,
      };
  }
}

function collectPayload(
  body: Record<string, unknown>,
): { ok: true; payload?: Record<string, unknown> } | ControlEventError {
  if (body.payload !== undefined && !isPlainObject(body.payload)) {
    return {
      ok: false,
      error: "invalid_field",
      message: "payload must be a JSON object",
    };
  }

  const payload = isPlainObject(body.payload) ? { ...body.payload } : {};

  for (const key of STREAMDECK_PASSTHROUGH) {
    if (body[key] !== undefined && payload[key] === undefined) {
      payload[key] = body[key];
    }
  }

  return {
    ok: true,
    payload: Object.keys(payload).length > 0 ? payload : undefined,
  };
}

export function parseControlEvent(body: unknown): ControlEventResult {
  if (!isPlainObject(body)) {
    return {
      ok: false,
      error: "invalid_body",
      message: "body must be a JSON object",
    };
  }

  const typeResult = readOptionalString(body.type ?? body.event, "type");
  if (typeResult && typeof typeResult === "object") {
    return typeResult;
  }
  if (!typeResult) {
    return {
      ok: false,
      error: "missing_type",
      message: "type (or event) is required",
    };
  }

  const source = parseSource(body.source);
  if (typeof source === "object") {
    return source;
  }

  const action = readOptionalString(body.action, "action");
  if (action && typeof action === "object") {
    return action;
  }

  const id = readOptionalString(body.id, "id");
  if (id && typeof id === "object") {
    return id;
  }

  const payloadResult = collectPayload(body);
  if (!payloadResult.ok) {
    return payloadResult;
  }

  const event: ControlEvent = {
    type: typeResult,
    source,
  };

  if (action) {
    event.action = action;
  }
  if (id) {
    event.id = id;
  }
  if (payloadResult.payload) {
    event.payload = payloadResult.payload;
  }

  return { ok: true, event };
}

export async function readJsonBody(
  request: Request,
): Promise<{ ok: true; body: unknown } | ControlEventError> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = Number(contentLength);
    if (Number.isFinite(size) && size > MAX_CONTROL_BODY_BYTES) {
      return {
        ok: false,
        error: "invalid_body",
        message: `body must be at most ${MAX_CONTROL_BODY_BYTES} bytes`,
      };
    }
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return {
      ok: false,
      error: "invalid_json",
      message: "unable to read request body",
    };
  }

  if (raw.length > MAX_CONTROL_BODY_BYTES) {
    return {
      ok: false,
      error: "invalid_body",
      message: `body must be at most ${MAX_CONTROL_BODY_BYTES} bytes`,
    };
  }

  if (raw.trim().length === 0) {
    return {
      ok: false,
      error: "invalid_json",
      message: "body must be valid JSON",
    };
  }

  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return {
      ok: false,
      error: "invalid_json",
      message: "body must be valid JSON",
    };
  }
}
