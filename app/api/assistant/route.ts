import { NextResponse } from "next/server";

import { buildAssistantContext, generateAssistantReply } from "@/lib/ai/assistant";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
      context?: unknown;
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const contextInput =
      typeof body.context === "object" && body.context !== null
        ? (body.context as Parameters<typeof buildAssistantContext>[0])
        : undefined;
    const context = buildAssistantContext(contextInput);
    const reply = await generateAssistantReply({
      message,
      history: Array.isArray(body.history) ? body.history.slice(-6) : [],
      context,
    });

    return NextResponse.json({ reply, context });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Assistant request failed.";
    const status = /unauthorized|api key/i.test(message) ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
