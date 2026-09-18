# jarvis-agents

Jarvis agents execution API — Vercel project `jarvis-agents-that-execute-au`.

Owned by Jarvis Agents Builder. Lead: Jarvis Lead.

Headless Next.js App Router API for agents that execute. Slice 0 ships live health plus Stream Deck / HUD control events. No auth in v0.

## Endpoints

CORS is open for Jarvis HUD origins: request `Origin` is echoed when present (including `*.vercel.app` and localhost). Requests without `Origin` receive `Access-Control-Allow-Origin: *`. `OPTIONS` preflight is supported on every route.

### `GET /api/health`

Liveness probe.

```json
{ "ok": true, "service": "jarvis-agents" }
```

```bash
curl -sS https://<host>/api/health
```

### `POST /api/control`

Accepts Stream Deck / HUD control events. No authentication in v0.

**Request:** JSON object. `type` is required (`event` is accepted as an alias). Optional fields: `source`, `action`, `id`, `payload`.

| Field | Rules |
| --- | --- |
| `type` / `event` | Required non-empty string, max 128 chars |
| `source` | `streamdeck`, `hud`, `agent`, or `unknown` (default). `stream-deck` aliases to `streamdeck` |
| `action` | Optional non-empty string, max 128 chars |
| `id` | Optional non-empty string, max 128 chars |
| `payload` | Optional JSON object. Stream Deck `context`, `device`, and `deviceName` are copied into `payload` when omitted there |

Invalid JSON, non-object bodies, missing `type`, and oversized bodies (>16 KiB) return `400`.

**Success:**

```json
{
  "ok": true,
  "accepted": true,
  "event": {
    "type": "keyDown",
    "source": "streamdeck",
    "action": "com.jarvis.hud.toggle",
    "payload": { "coordinates": { "column": 0, "row": 0 } }
  },
  "storedAt": "2026-09-18T06:20:00.000Z"
}
```

```bash
curl -sS -X POST https://<host>/api/control \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://jarvis.vercel.app' \
  -d '{"event":"keyDown","source":"stream-deck","action":"com.jarvis.hud.toggle","payload":{"coordinates":{"column":0,"row":0}}}'
```

### `GET /api/control`

Returns the last accepted control event, or `null` if none has been stored in this instance.

```json
{ "ok": true, "event": { "type": "keyDown", "source": "streamdeck" }, "storedAt": "2026-09-18T06:20:00.000Z" }
```

v0 storage is process-local (the current serverless isolate). The POST response always echoes the accepted event; do not rely on GET for durable history.

### `GET /`

Service index listing the routes above.

## Local development

```bash
npm install
npm test
npm run typecheck
npm run dev
```

Dev server: [http://localhost:3000](http://localhost:3000)

## Deploy

Vercel project: `jarvis-agents-that-execute-au` (scherzo-io/jarvis-agents).
