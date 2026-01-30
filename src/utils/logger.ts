type LogLevel = "debug" | "info" | "warn" | "error";
type LogPayload = Record<string, unknown>;

const REDACT_KEYS = new Set([
  "authorization",
  "token",
  "token_ws",
  "apiKey",
  "apiKeySecret",
  "secret",
  "password",
  "cardNumber",
  "card_number",
  "jwt",
]);

const sanitize = (value: unknown, depth: number, seen: WeakSet<object>): unknown => {
  if (depth > 6) {
    return "[Truncated]";
  }

  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, depth + 1, seen));
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    seen.add(value);
    const output: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, raw]) => {
      if (REDACT_KEYS.has(key)) {
        output[key] = "[REDACTED]";
        return;
      }
      output[key] = sanitize(raw, depth + 1, seen);
    });
    return output;
  }

  return String(value);
};

const buildEntry = (level: LogLevel, event: string, data?: LogPayload) => {
  const base: LogPayload = {
    ts: new Date().toISOString(),
    level,
    event,
    app: "covasa-front",
  };
  const sanitized = data ? sanitize(data, 0, new WeakSet()) : {};
  if (sanitized && typeof sanitized === "object" && !Array.isArray(sanitized)) {
    return { ...base, ...(sanitized as LogPayload) };
  }
  return { ...base, data: sanitized };
};

const write = (level: LogLevel, event: string, data?: LogPayload) => {
  const payload = buildEntry(level, event, data);
  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  if (level === "debug") {
    console.debug(line);
    return;
  }
  console.log(line);
};

export const uiLogger = {
  debug: (event: string, data?: LogPayload) => write("debug", event, data),
  info: (event: string, data?: LogPayload) => write("info", event, data),
  warn: (event: string, data?: LogPayload) => write("warn", event, data),
  error: (event: string, data?: LogPayload) => write("error", event, data),
};
