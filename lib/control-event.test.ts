import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseControlEvent, readJsonBody } from "./control-event.ts";

describe("parseControlEvent", () => {
  it("accepts a Stream Deck keyDown event", () => {
    const result = parseControlEvent({
      event: "keyDown",
      source: "stream-deck",
      action: "com.jarvis.hud.toggle",
      context: "abc",
      payload: { coordinates: { column: 0, row: 1 } },
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.deepEqual(result.event, {
      type: "keyDown",
      source: "streamdeck",
      action: "com.jarvis.hud.toggle",
      payload: {
        coordinates: { column: 0, row: 1 },
        context: "abc",
      },
    });
  });

  it("accepts a HUD command with type", () => {
    const result = parseControlEvent({
      type: "command",
      source: "hud",
      id: "run-1",
      action: "execute",
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(result.event.type, "command");
    assert.equal(result.event.source, "hud");
    assert.equal(result.event.id, "run-1");
    assert.equal(result.event.action, "execute");
  });

  it("defaults source to unknown", () => {
    const result = parseControlEvent({ type: "ping" });
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.event.source, "unknown");
  });

  it("rejects arrays and primitives", () => {
    assert.equal(parseControlEvent(["keyDown"]).ok, false);
    assert.equal(parseControlEvent("keyDown").ok, false);
    assert.equal(parseControlEvent(null).ok, false);
  });

  it("rejects a missing type", () => {
    const result = parseControlEvent({ source: "hud" });
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.equal(result.error, "missing_type");
  });

  it("rejects a non-object payload", () => {
    const result = parseControlEvent({ type: "keyDown", payload: [] });
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.equal(result.error, "invalid_field");
  });
});

describe("readJsonBody", () => {
  it("parses a JSON object", async () => {
    const result = await readJsonBody(
      new Request("http://localhost/api/control", {
        method: "POST",
        body: JSON.stringify({ type: "ping" }),
      }),
    );

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.deepEqual(result.body, { type: "ping" });
  });

  it("rejects invalid JSON", async () => {
    const result = await readJsonBody(
      new Request("http://localhost/api/control", {
        method: "POST",
        body: "{",
      }),
    );

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.equal(result.error, "invalid_json");
  });

  it("rejects oversized bodies", async () => {
    const result = await readJsonBody(
      new Request("http://localhost/api/control", {
        method: "POST",
        headers: { "content-length": "99999" },
        body: "{}",
      }),
    );

    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.equal(result.error, "invalid_body");
  });
});
