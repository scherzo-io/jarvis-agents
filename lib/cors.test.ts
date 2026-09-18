import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { corsHeaders, isAllowedOrigin, optionsResponse } from "./cors.ts";

describe("isAllowedOrigin", () => {
  it("allows missing origins, localhost, and vercel.app", () => {
    assert.equal(isAllowedOrigin(null), true);
    assert.equal(isAllowedOrigin("http://localhost:3000"), true);
    assert.equal(isAllowedOrigin("https://jarvis.vercel.app"), true);
    assert.equal(isAllowedOrigin("https://hud-preview.vercel.app"), true);
  });

  it("rejects non-http origins", () => {
    assert.equal(isAllowedOrigin("ftp://example.com"), false);
    assert.equal(isAllowedOrigin("not a url"), false);
  });
});

describe("corsHeaders", () => {
  it("echoes an allowed Origin and otherwise uses *", () => {
    const echoed = corsHeaders(
      new Request("http://localhost/api/health", {
        headers: { origin: "https://jarvis.vercel.app" },
      }),
    );
    assert.equal(
      echoed.get("Access-Control-Allow-Origin"),
      "https://jarvis.vercel.app",
    );
    assert.equal(echoed.get("Access-Control-Allow-Methods"), "GET, POST, OPTIONS");

    const wildcard = corsHeaders();
    assert.equal(wildcard.get("Access-Control-Allow-Origin"), "*");
  });
});

describe("optionsResponse", () => {
  it("returns 204 for preflight", () => {
    const response = optionsResponse(
      new Request("http://localhost/api/control", {
        method: "OPTIONS",
        headers: { origin: "https://hud.vercel.app" },
      }),
    );
    assert.equal(response.status, 204);
    assert.equal(
      response.headers.get("Access-Control-Allow-Origin"),
      "https://hud.vercel.app",
    );
  });
});
