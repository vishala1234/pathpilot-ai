"use client";

import {
  BotIcon,
  MessageSquareTextIcon,
  SendIcon,
  SparklesIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile, useProgressState, useRoadmap, useStoresHydrated } from "@/lib/store";
import { buildAssistantContext } from "@/lib/ai/assistant";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_PROMPTS = [
  "What should I learn today?",
  "I missed three days. What should I do?",
  "Which project should I build next?",
  "How can I prepare for interviews?",
  "Why is this skill important?",
];

export function AssistantView() {
  const hydrated = useStoresHydrated();
  const profile = useProfile();
  const roadmap = useRoadmap();
  const progress = useProgressState();

  const context = useMemo(
    () => buildAssistantContext({ profile, roadmap, progress }),
    [profile, roadmap, progress]
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Failed to get response");
      }

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply! },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <>
        <PageHeader
          eyebrow="Career assistant"
          title="Loading assistant"
          description="Preparing your grounded coaching context."
          badge="Loading"
        />
        <div className="container-page py-8 md:py-12">
          <div className="h-96 animate-pulse rounded-2xl bg-muted/60" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Career assistant"
        title="A coach that knows your plan"
        description="Grounded in your profile, roadmap progress and current taskStatus. Suggestions only — no automatic mutations."
        badge={context.missingApiKey ? "Offline fallback" : "Groq ready"}
        actions={
          <Button  variant="outline" render={<Link href="/dashboard" className="gap-1.5" />}>View progress
              <SparklesIcon className="size-4" /></Button>
        }
      />

      <div className="container-page space-y-4 py-8 md:py-10">
        <Card className="ring-1 ring-foreground/5">
          <CardContent className="space-y-4 p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <BotIcon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">PathPilot Assistant</p>
                  <p className="text-xs text-muted-foreground">
                    {context.targetCareer
                      ? `Coaching for ${context.targetCareer.replace(/-/g, " ")}`
                      : "Complete onboarding for personalized advice"}
                  </p>
                </div>
              </div>
              {context.todayPlan ? (
                <Badge variant="outline">
                  Day {context.todayPlan.dayIndex} ·{" "}
                  {context.todayPlan.complete ? "Complete" : `${context.todayPlan.completedTasks}/${context.todayPlan.totalTasks} done`}
                </Badge>
              ) : null}
            </div>

            <div
              className="min-h-[320px] space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3 md:min-h-[420px] md:p-4"
              role="log"
              aria-live="polite"
              aria-label="Chat messages"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <MessageSquareTextIcon className="size-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-heading text-lg">Ask me anything about your plan</p>
                    <p className="text-sm text-muted-foreground">
                      I only use your PathPilot context — never your full localStorage.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => sendMessage(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed md:max-w-[70%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card"
                      )}
                    >
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] opacity-70">
                        {message.role === "user" ? (
                          <>
                            <UserIcon className="size-3" />
                            You
                          </>
                        ) : (
                          <>
                            <BotIcon className="size-3" />
                            PathPilot
                          </>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading ? (
                <div className="flex gap-2">
                  <div className="max-w-[70%] rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm">
                    <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <BotIcon className="size-3" />
                      PathPilot
                    </div>
                    <p className="text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            ) : null}

            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask what to focus on, how to prepare, or what to build next..."
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                aria-label="Message to assistant"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <SendIcon />
                Send
              </Button>
            </form>

            <p className="text-[11px] text-muted-foreground">
              AI suggestions only. Task completion and roadmap changes require
              explicit action in the UI. {context.missingApiKey ? "No API key detected — using deterministic fallback." : ""}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
