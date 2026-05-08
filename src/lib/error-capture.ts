// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

function isObjectWithKey(value: unknown, key: string): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && key in value;
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => {
    if (isObjectWithKey(event, "error")) {
      record(event.error);
      return;
    }
    record(event);
  });

  globalThis.addEventListener("unhandledrejection", (event) => {
    if (isObjectWithKey(event, "reason")) {
      record(event.reason);
      return;
    }
    record(event);
  });
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
