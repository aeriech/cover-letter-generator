export type SSEEvent =
  | { type: "chunk"; text: string }
  | { type: "status"; message: string }
  | { type: "done"; ok: boolean }
  | { type: "error"; message: string }
  | { type: "completed" }
  | { type: "aborted" };

export interface StreamHandlers {
  onEvent: (event: SSEEvent) => void;
  signal?: AbortSignal;
}

export async function streamSSE(
  url: string,
  body: unknown,
  { onEvent, signal }: StreamHandlers
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore parse errors
    }
    onEvent({ type: "error", message });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const parsed = parseEvent(rawEvent);
        if (parsed) onEvent(parsed);
      }
    }
    if (buffer.trim()) {
      const parsed = parseEvent(buffer);
      if (parsed) onEvent(parsed);
    }
  } finally {
    reader.releaseLock();
  }
}

function parseEvent(raw: string): SSEEvent | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }

  const data = dataLines.join("\n");
  if (!data) return null;

  try {
    const payload = JSON.parse(data);
    switch (event) {
      case "chunk":
        return { type: "chunk", text: payload.text ?? "" };
      case "status":
        return { type: "status", message: payload.message ?? "" };
      case "done":
        return { type: "done", ok: payload.ok ?? false };
      case "error":
        return { type: "error", message: payload.message ?? "Unknown error" };
      case "completed":
        return { type: "completed" };
      case "aborted":
        return { type: "aborted" };
      default:
        return null;
    }
  } catch {
    return null;
  }
}
