import type {
  Day,
  Phase,
  Profile,
  ProgressState,
  ProgressSummary,
  Roadmap,
} from "@/types";

import { getProjectsForCareer } from "@/lib/data/projects";
import { calculateProgress, getDayProgress, getNextIncompleteDay } from "@/lib/engine";
import { getTodayPlan } from "@/lib/store/selectors";

export type AssistantContextInput = {
  profile?: Profile | null;
  roadmap?: Roadmap | null;
  progress?: ProgressState | null;
  today?: Date;
};

export type AssistantContext = {
  profile: Profile | null;
  roadmapId: string | null;
  targetCareer: string | null;
  experienceLevel: string | null;
  dailyMinutes: number | null;
  daysPerWeek: number | null;
  overallProgress: ProgressSummary | null;
  todayPlan: {
    dayIndex: number | null;
    topic: string | null;
    phaseTitle: string | null;
    completedTasks: number;
    totalTasks: number;
    complete: boolean;
    scheduledToday: boolean;
  } | null;
  nextIncomplete: {
    dayIndex: number;
    topic: string;
    phaseTitle: string | null;
  } | null;
  currentPhase: {
    title: string;
    order: number;
    kind: string;
    completedDays: number;
    totalDays: number;
  } | null;
  recommendedProjects: Array<{ id: string; title: string; level: string }>;
  missingApiKey: boolean;
};

export function buildAssistantContext(input: AssistantContextInput = {}): AssistantContext {
  const profile = input.profile ?? null;
  const roadmap = input.roadmap ?? null;
  const progress = input.progress ?? null;

  const overallProgress =
    roadmap && progress && progress.roadmapId === roadmap.id
      ? calculateProgress(roadmap, progress)
      : null;

  const todayPlan = roadmap && progress ? getTodayPlan(roadmap, progress, input.today) : null;
  const nextIncomplete = roadmap && progress ? getNextIncompleteDay(roadmap, progress) : null;

  let currentPhase: AssistantContext["currentPhase"] = null;
  if (roadmap && progress && nextIncomplete) {
    const phase = roadmap.phases.find((p) => p.dayIds.includes(nextIncomplete.id));
    if (phase) {
      const completedDays = roadmap.days.filter(
        (d) => phase.dayIds.includes(d.id) && getDayProgress(d, progress).complete
      ).length;
      currentPhase = {
        title: phase.title,
        order: phase.order,
        kind: phase.kind,
        completedDays,
        totalDays: phase.dayIds.length,
      };
    }
  } else if (roadmap && progress && overallProgress) {
    // If everything complete, show last phase
    const lastPhase = [...roadmap.phases].sort((a, b) => a.order - b.order).at(-1);
    if (lastPhase) {
      const completedDays = roadmap.days.filter(
        (d) => lastPhase.dayIds.includes(d.id) && getDayProgress(d, progress).complete
      ).length;
      currentPhase = {
        title: lastPhase.title,
        order: lastPhase.order,
        kind: lastPhase.kind,
        completedDays,
        totalDays: lastPhase.dayIds.length,
      };
    }
  }

  const phaseTitleForDay = (day: Day): string | null => {
    const phase = roadmap?.phases.find((p) => p.dayIds.includes(day.id));
    return phase?.title ?? null;
  };

  const recommendedProjects =
    profile?.targetCareerId
      ? getProjectsForCareer(profile.targetCareerId)
          .slice(0, 3)
          .map((p) => ({ id: p.id, title: p.title, level: p.level }))
      : [];

  return {
    profile,
    roadmapId: roadmap?.id ?? null,
    targetCareer: profile?.targetCareerId ?? null,
    experienceLevel: profile?.experienceLevel ?? null,
    dailyMinutes: profile?.dailyMinutes ?? null,
    daysPerWeek: profile?.daysPerWeek ?? null,
    overallProgress,
    todayPlan: todayPlan
      ? {
          dayIndex: todayPlan.day.index,
          topic: todayPlan.day.topic,
          phaseTitle: phaseTitleForDay(todayPlan.day),
          completedTasks: todayPlan.progress.completedTasks,
          totalTasks: todayPlan.progress.totalTasks,
          complete: todayPlan.progress.complete,
          scheduledToday: todayPlan.scheduledToday,
        }
      : null,
    nextIncomplete: nextIncomplete
      ? {
          dayIndex: nextIncomplete.index,
          topic: nextIncomplete.topic,
          phaseTitle: phaseTitleForDay(nextIncomplete),
        }
      : null,
    currentPhase,
    recommendedProjects,
    missingApiKey: !process.env.GROQ_API_KEY,
  };
}

const SYSTEM_PROMPT = `You are PathPilot AI, a grounded career-learning coach for college students.

Rules:
- You ONLY know the student's PathPilot context provided to you. Do not invent completed tasks, streaks, or roadmap changes.
- Never claim you modified taskStatus, the roadmap, or progress. If suggesting changes, say "I suggest..." and explain they require explicit confirmation in the UI.
- Be practical and specific to their target career, current phase/day, and available study time.
- Prioritize actionable advice: what to do next, how to practice, what to build.
- Keep answers concise and scannable.
- If context is missing (no roadmap/profile), tell them to complete onboarding first.
- Do not expose API keys or internal implementation details.`;

function fallbackReply(message: string, context: AssistantContext): string {
  const lower = message.toLowerCase();

  if (!context.profile || !context.roadmapId) {
    return "You don't have a roadmap yet. Head to /onboarding to build your personalized 45-day plan, then I'll coach you based on your actual progress.";
  }

  if (lower.includes("today") || lower.includes("focus")) {
    if (context.todayPlan) {
      if (context.todayPlan.complete) {
        return `You've completed today's plan (Day ${context.todayPlan.dayIndex}: ${context.todayPlan.topic}). Your next focus is Day ${context.nextIncomplete?.dayIndex ?? "—"}: ${context.nextIncomplete?.topic ?? "keep going through your roadmap"}. Spend ${context.dailyMinutes ?? 60} min on it.`;
      }
      return `Focus on Day ${context.todayPlan.dayIndex}: ${context.todayPlan.topic} (${context.todayPlan.phaseTitle ?? "current phase"}). You've done ${context.todayPlan.completedTasks}/${context.todayPlan.totalTasks} tasks. Work through the remaining tasks in /roadmap and mark them complete.`;
    }
    if (context.nextIncomplete) {
      return `Start with Day ${context.nextIncomplete.dayIndex}: ${context.nextIncomplete.topic} in /roadmap. Aim for ${context.dailyMinutes ?? 60} focused minutes today.`;
    }
    return "Your roadmap looks complete! Review a project in /projects to build something for your portfolio.";
  }

  if (lower.includes("miss") || lower.includes("behind") || lower.includes("catch up")) {
    return `Don't restart — protect completed work. Open /roadmap, focus on your next incomplete day (${context.nextIncomplete ? `Day ${context.nextIncomplete.dayIndex}` : "next up"}), and do a shorter focused session (${Math.max(30, Math.floor((context.dailyMinutes ?? 60) * 0.6))} min) today. Consistency beats cramming.`;
  }

  if (lower.includes("project") || lower.includes("build")) {
    const recs = context.recommendedProjects.map((p) => p.title).join(", ");
    return recs
      ? `For your ${context.targetCareer ?? "target role"}, try: ${recs}. Pick the one matching your current level and build it end-to-end with a README. See all options in /projects.`
      : "Check /projects for career-matched portfolio projects you can build to demonstrate your skills.";
  }

  if (lower.includes("interview") || lower.includes("prepare")) {
    return `Practice explaining what you built. Review your completed days in /roadmap, pick one project from /projects, and do 5-10 min of targeted review on weak topics from your current phase (${context.currentPhase?.title ?? "upcoming phase"}).`;
  }

  if (lower.includes("important") || lower.includes("why")) {
    return `Skills matter because they connect directly to your target career. Focus on the tasks in your current roadmap phase — each is chosen to close gaps for your goals. Check your progress in /dashboard.`;
  }

  return `Based on your plan (${context.targetCareer ?? "your goal"}), do the next incomplete task in /roadmap. Small daily progress beats occasional long sessions. If you tell me a specific topic you're stuck on, I can suggest a focused approach.`;
}

export async function generateAssistantReply(params: {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  context: AssistantContext;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackReply(params.message, params.context);
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
  const contextSummary = JSON.stringify(
    {
      career: params.context.targetCareer,
      level: params.context.experienceLevel,
      dailyMinutes: params.context.dailyMinutes,
      progress: params.context.overallProgress
        ? {
            completedTasks: params.context.overallProgress.completedTasks,
            totalTasks: params.context.overallProgress.totalTasks,
            completedDays: params.context.overallProgress.completedDays,
            streak: params.context.overallProgress.currentStreak,
          }
        : null,
      todayPlan: params.context.todayPlan,
      currentPhase: params.context.currentPhase,
      nextIncomplete: params.context.nextIncomplete,
      projects: params.context.recommendedProjects,
    },
    null,
    0
  );

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 512,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "system",
            content: `PathPilot context (structured): ${contextSummary}`,
          },
          ...params.history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: params.message },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Groq API error (${response.status}): ${text.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Invalid AI response");
    return content;
  } catch {
    return fallbackReply(params.message, params.context);
  }
}
