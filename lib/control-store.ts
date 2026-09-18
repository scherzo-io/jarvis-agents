import type { ControlEvent } from "./control-event";

export type StoredControlEvent = {
  event: ControlEvent;
  storedAt: string;
};

let lastEvent: StoredControlEvent | null = null;

export function storeControlEvent(event: ControlEvent): StoredControlEvent {
  lastEvent = {
    event,
    storedAt: new Date().toISOString(),
  };
  return lastEvent;
}

export function getLastControlEvent(): StoredControlEvent | null {
  return lastEvent;
}

export function resetControlStore(): void {
  lastEvent = null;
}
