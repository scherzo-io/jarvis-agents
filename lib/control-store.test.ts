import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  getLastControlEvent,
  resetControlStore,
  storeControlEvent,
} from "./control-store.ts";

describe("control store", () => {
  afterEach(() => {
    resetControlStore();
  });

  it("starts empty", () => {
    assert.equal(getLastControlEvent(), null);
  });

  it("stores and returns the last event", () => {
    const first = storeControlEvent({ type: "one", source: "hud" });
    const second = storeControlEvent({ type: "two", source: "streamdeck" });

    assert.equal(first.event.type, "one");
    assert.equal(getLastControlEvent()?.event.type, "two");
    assert.equal(getLastControlEvent()?.storedAt, second.storedAt);
    assert.match(second.storedAt, /^\d{4}-\d{2}-\d{2}T/);
  });
});
