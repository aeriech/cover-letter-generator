import { ChatSession, GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt, type FormState } from "@/lib/prompt";

type SSEEvent =
  | { readonly type: "chunk"; text: string }
  | { readonly type: "status"; message: string }
  | { readonly type: "done"; ok: boolean }
  | { readonly type: "error"; message: string }
  | { readonly type: "completed" }
  | { readonly type: "aborted" };

const FREE_TIER_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-1.5-flash",
] as const;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable");
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function humanizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const idx = msg.indexOf(":");
  return idx !== -1 ? msg.slice(idx + 1).trim() : msg;
}

async function* runStreamWithFallback(
  data: FormState,
  signal: AbortSignal
): AsyncGenerator<SSEEvent> {
  const systemInstruction = buildSystemPrompt(data);

  for (let modelIdx = 0; modelIdx < FREE_TIER_MODELS.length; modelIdx++) {
    const model = FREE_TIER_MODELS[modelIdx];
    let session: ChatSession | null = null;

    try {
      if (modelIdx > 0) {
        const backoffMs = Math.min(modelIdx * 700, 4000);
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, backoffMs);
          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(new Error("aborted"));
            },
            { once: true }
          );
        });
        if (signal.aborted) {
          yield { type: "aborted" };
          return;
        }
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
      const generativeModel = genAI.getGenerativeModel({ model });
      const systemInstructionContent = {
        role: "user",
        parts: [{ text: systemInstruction }],
      };
      session = generativeModel.startChat({
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        systemInstruction: systemInstructionContent,
      });

      const { stream } = await session.sendMessageStream("Generate the cover letter now.");

      let streamed = false;

      try {
        for await (const chunk of stream) {
          if (signal.aborted) {
            yield { type: "aborted" };
            return;
          }
          const text = chunk.text();
          if (!text) continue;
          streamed = true;
          yield { type: "chunk", text };
        }
      } finally {
        session = null;
      }

      if (streamed) {
        yield { type: "status", message: `via ${model}` };
        yield { type: "done", ok: true };
        yield { type: "completed" };
        return;
      }

      yield {
        type: "error",
        message: `Model ${model} returned no content.`,
      };
      yield { type: "completed" };
      return;
    } catch (err) {
      if (signal.aborted) {
        yield { type: "aborted" };
        return;
      }

      yield {
        type: "status",
        message: `Model ${model} failed — switching… (${humanizeError(err)})`,
      };

      if (modelIdx === FREE_TIER_MODELS.length - 1) {
        yield {
          type: "error",
          message: "All available AI models failed to process the request. Please try again.",
        };
        yield { type: "completed" };
        return;
      }

      continue;
    } finally {
      session = null;
    }
  }
}

export async function POST(request: Request) {
  let signal: AbortSignal;

  try {
    signal = request.signal;
  } catch {
    return new Response(JSON.stringify({ error: "invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: FormState;
  try {
    body = (await request.json()) as FormState;
  } catch {
    return new Response(JSON.stringify({ error: "invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (typeof body.fullName !== "string" || body.fullName.trim() === "") {
    return new Response(JSON.stringify({ error: "fullName must not be empty" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (typeof body.experienceSummary !== "string" || body.experienceSummary.trim() === "") {
    return new Response(JSON.stringify({ error: "experienceSummary must not be empty" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (typeof body.jobDescription !== "string" || body.jobDescription.trim() === "") {
    return new Response(JSON.stringify({ error: "jobDescription must not be empty" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formality = clamp(body.formality ?? 7, 1, 10);
  const friendliness = clamp(body.friendliness ?? 5, 1, 10);

  const sanitized: FormState = {
    ...body,
    formality,
    friendliness,
  };

  const streamGen = runStreamWithFallback(sanitized, signal);

  const encoder = new TextEncoder();

  const abortable = signal as AbortSignal & { abort: () => void };
  const bodyStream = new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await streamGen.next();
        if (done) {
          controller.close();
          return;
        }

        const ev = value;
        const payload = encoder.encode(
          `event: ${ev.type}\ndata: ${JSON.stringify(ev)}\n\n`
        );
        controller.enqueue(payload);
      } catch {
        controller.close();
      }
    },
    cancel() {
      abortable.abort();
    },
  });

  return new Response(bodyStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function GET() {
  return new Response(JSON.stringify({ error: "method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
