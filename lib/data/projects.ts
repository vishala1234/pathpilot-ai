import type { Project } from "@/types";

/**
 * Portfolio projects referenced by the career catalog. The level field keeps
 * recommendations honest: a beginner should not be handed a production
 * Kubernetes platform on day one.
 */
export const PROJECTS: Project[] = [
  // AI Engineer
  {
    id: "rag-study-assistant",
    title: "RAG Study Assistant",
    summary:
      "Upload course notes and ask questions. Answers are grounded in retrieved passages with visible citations.",
    whyItMatters:
      "Demonstrates retrieval, prompt design and API work — the three skills AI Engineer interviews probe hardest.",
    careerIds: ["ai-engineer"],
    level: "intermediate",
    estimatedHours: 14,
    skills: ["rag-systems", "llm-prompting", "nextjs", "api-design"],
    deliverables: [
      "Document ingestion and chunking pipeline",
      "Vector search with source citations",
      "Chat UI with streaming responses",
      "README covering evaluation and limitations",
    ],
    repoName: "rag-study-assistant",
  },
  {
    id: "agentic-research-copilot",
    title: "Agentic Research Copilot",
    summary:
      "An agent that plans a research question, calls search and calculation tools, and writes a cited brief.",
    whyItMatters:
      "Shows you can build safe tool-using agents rather than a single prompt, which is the current hiring bar for AI roles.",
    careerIds: ["ai-engineer"],
    level: "advanced",
    estimatedHours: 20,
    skills: [
      "agentic-ai",
      "docker",
      "monitoring-observability",
      "technical-writing",
    ],
    deliverables: [
      "Typed tool schemas with guardrails",
      "Multi-step planning loop with retries",
      "Trace viewer for agent runs",
      "Deployed demo and architecture notes",
    ],
    repoName: "agentic-research-copilot",
  },

  // Data Scientist
  {
    id: "churn-prediction-lab",
    title: "Churn Prediction Lab",
    summary:
      "Predict which subscribers will cancel, explain the drivers and quantify the revenue at stake.",
    whyItMatters:
      "A complete supervised learning story — cleaning, features, validation, interpretation and business impact.",
    careerIds: ["data-scientist"],
    level: "intermediate",
    estimatedHours: 12,
    skills: [
      "pandas",
      "scikit-learn",
      "feature-engineering",
      "model-evaluation",
    ],
    deliverables: [
      "Reproducible cleaning and feature pipeline",
      "Baseline versus tuned model comparison",
      "Segment-level error analysis",
      "Business recommendation with expected lift",
    ],
    repoName: "churn-prediction-lab",
  },
  {
    id: "experiment-analysis-toolkit",
    title: "Experiment Analysis Toolkit",
    summary:
      "A reusable notebook and small app for sizing tests, checking assumptions and reading results.",
    whyItMatters:
      "Experimentation literacy is scarce. Showing rigorous A/B analysis signals product maturity.",
    careerIds: ["data-scientist", "data-analyst"],
    level: "intermediate",
    estimatedHours: 10,
    skills: ["a-b-testing", "statistics", "data-visualization", "python"],
    deliverables: [
      "Power and sample-size calculator",
      "Guardrail metric checks",
      "Sequential testing warnings",
      "Example readout with a decision",
    ],
    repoName: "experiment-analysis-toolkit",
  },

  // Data Analyst
  {
    id: "sales-insights-dashboard",
    title: "Sales Insights Dashboard",
    summary:
      "A Tableau dashboard that explains regional revenue, margin and product mix for a fictional retailer.",
    whyItMatters:
      "Proves you can model data and build a dashboard around a decision, not just a pile of charts.",
    careerIds: ["data-analyst"],
    level: "intermediate",
    estimatedHours: 10,
    skills: ["sql", "tableau", "data-visualization", "data-modeling"],
    deliverables: [
      "Documented star schema",
      "Validated SQL extracts",
      "Two-page interactive dashboard",
      "Written insight summary",
    ],
    repoName: "sales-insights-dashboard",
  },
  {
    id: "marketing-funnel-analysis",
    title: "Marketing Funnel Analysis",
    summary:
      "Analyse a campaign funnel, find the biggest drop-off and recommend the next experiment.",
    whyItMatters:
      "Shows funnel reasoning, clean spreadsheet-to-SQL work and a stakeholder-ready recommendation.",
    careerIds: ["data-analyst"],
    level: "beginner",
    estimatedHours: 6,
    skills: ["excel", "sql", "data-cleaning", "presentation"],
    deliverables: [
      "Cleaned campaign dataset",
      "Step-by-step funnel chart",
      "Segment comparison",
      "One-page recommendation memo",
    ],
    repoName: "marketing-funnel-analysis",
  },

  // Full-Stack Developer
  {
    id: "collaborative-task-board",
    title: "Collaborative Task Board",
    summary:
      "A small Trello-style board with accounts, drag-and-drop columns and shared workspaces.",
    whyItMatters:
      "Covers auth, relational modelling, mutations and optimistic UI — a realistic slice of product engineering.",
    careerIds: ["full-stack-developer"],
    level: "intermediate",
    estimatedHours: 16,
    skills: ["nextjs", "react", "databases", "authentication"],
    deliverables: [
      "Email/password and OAuth sign-in",
      "Workspace and board data model",
      "Drag-and-drop with persistence",
      "Deployed app and seeded demo account",
    ],
    repoName: "collaborative-task-board",
  },
  {
    id: "full-stack-notes-app",
    title: "Full-Stack Notes App",
    summary:
      "A focused notes app with markdown, tags and server-side search — deliberately small and finished.",
    whyItMatters:
      "A finished small app beats an abandoned ambitious one. Demonstrates CRUD, validation and deployment.",
    careerIds: ["full-stack-developer"],
    level: "beginner",
    estimatedHours: 8,
    skills: ["react", "nodejs", "rest-apis", "html-css"],
    deliverables: [
      "Markdown editor and preview",
      "Tag filtering and server search",
      "Input validation and error states",
      "Live deployment and README",
    ],
    repoName: "full-stack-notes-app",
  },

  // ML Engineer
  {
    id: "ml-model-serving-platform",
    title: "ML Model Serving Platform",
    summary:
      "Package, deploy and monitor a model behind a versioned API with a rollback path.",
    whyItMatters:
      "This is the core ML Engineer loop: training artefact, container, service, monitoring, rollback.",
    careerIds: ["machine-learning-engineer"],
    level: "advanced",
    estimatedHours: 24,
    skills: ["mlops", "docker", "kubernetes", "monitoring-observability"],
    deliverables: [
      "Reproducible training image",
      "Versioned model registry",
      "Kubernetes deployment with health checks",
      "Dashboards for latency, drift and errors",
    ],
    repoName: "ml-model-serving-platform",
  },
  {
    id: "vision-quality-inspector",
    title: "Vision Quality Inspector",
    summary:
      "Fine-tune an image classifier to flag defective parts and explain its confidence.",
    whyItMatters:
      "Combines transfer learning with a concrete business metric and a deployment story.",
    careerIds: ["machine-learning-engineer", "ai-engineer"],
    level: "advanced",
    estimatedHours: 20,
    skills: ["computer-vision", "pytorch", "docker", "model-evaluation"],
    deliverables: [
      "Labelled dataset and augmentation pipeline",
      "Fine-tuned CNN with a baseline",
      "Confusion-matrix and failure gallery",
      "Containerised inference demo",
    ],
    repoName: "vision-quality-inspector",
  },

  // DevOps / Cloud
  {
    id: "kubernetes-platform-blueprint",
    title: "Kubernetes Platform Blueprint",
    summary:
      "Provision a small cloud platform with Terraform and run a demo service on Kubernetes.",
    whyItMatters:
      "Shows infrastructure as code, container orchestration and operational thinking in one repo.",
    careerIds: ["devops-cloud-engineer"],
    level: "advanced",
    estimatedHours: 18,
    skills: ["terraform", "kubernetes", "aws", "ci-cd"],
    deliverables: [
      "Modular Terraform for network and cluster",
      "Helm-based application deployment",
      "CI pipeline with plan and apply stages",
      "Runbook and cost estimate",
    ],
    repoName: "kubernetes-platform-blueprint",
  },
  {
    id: "ci-cd-pipeline-template",
    title: "CI/CD Pipeline Template",
    summary:
      "A reusable pipeline that lints, tests, builds a container and deploys with a manual approval gate.",
    whyItMatters:
      "Every team needs this, and it demonstrates that you understand the commit-to-production path.",
    careerIds: ["devops-cloud-engineer"],
    level: "beginner",
    estimatedHours: 6,
    skills: ["ci-cd", "git", "docker", "bash-scripting"],
    deliverables: [
      "Lint, test and build stages",
      "Cached dependency install",
      "Container publish step",
      "Protected production deploy",
    ],
    repoName: "ci-cd-pipeline-template",
  },

  // Cybersecurity
  {
    id: "home-soc-lab",
    title: "Home SOC Lab",
    summary:
      "Stand up a small detection lab, simulate an attack and write the investigation report.",
    whyItMatters:
      "Hiring managers want evidence you can investigate, not just name tools. This is that evidence.",
    careerIds: ["cybersecurity-analyst"],
    level: "intermediate",
    estimatedHours: 14,
    skills: ["siem", "incident-response", "threat-analysis", "monitoring-observability"],
    deliverables: [
      "Lab network diagram",
      "Log ingestion and two detection rules",
      "Attack simulation timeline",
      "Full incident report with recommendations",
    ],
    repoName: "home-soc-lab",
  },
  {
    id: "vulnerability-report-portfolio",
    title: "Vulnerability Report Portfolio",
    summary:
      "Scan a deliberately vulnerable app and produce a prioritised, business-aware remediation report.",
    whyItMatters:
      "Demonstrates risk communication and prioritisation, which matter more than raw scanner output.",
    careerIds: ["cybersecurity-analyst"],
    level: "beginner",
    estimatedHours: 8,
    skills: [
      "vulnerability-management",
      "penetration-testing",
      "technical-writing",
      "networking",
    ],
    deliverables: [
      "Asset inventory and scan results",
      "CVSS-scored finding set",
      "Prioritised remediation plan",
      "Executive summary",
    ],
    repoName: "vulnerability-report-portfolio",
  },

  // Product Manager
  {
    id: "campus-events-product-spec",
    title: "Campus Events Product Spec",
    summary:
      "Research, scope and specify a campus events product, including success metrics and a launch plan.",
    whyItMatters:
      "A complete PM artefact: problem, users, strategy, requirements, metrics and trade-offs.",
    careerIds: ["product-manager"],
    level: "beginner",
    estimatedHours: 8,
    skills: ["user-research", "product-strategy", "wireframing", "roadmapping"],
    deliverables: [
      "Five user interviews synthesised into themes",
      "Problem statement and opportunity sizing",
      "Wireframes and PRD",
      "Metric tree and launch checklist",
    ],
    repoName: "campus-events-product-spec",
  },
  {
    id: "subscription-retention-teardown",
    title: "Subscription Retention Teardown",
    summary:
      "Analyse a subscription product's retention curve and pitch three prioritised interventions.",
    whyItMatters:
      "Shows analytical product judgement and the ability to turn metrics into a credible roadmap.",
    careerIds: ["product-manager"],
    level: "intermediate",
    estimatedHours: 10,
    skills: ["product-metrics", "data-visualization", "prioritization", "presentation"],
    deliverables: [
      "Cohort retention analysis",
      "Churn driver hypotheses",
      "RICE-scored intervention backlog",
      "Stakeholder pitch deck",
    ],
    repoName: "subscription-retention-teardown",
  },
];

export const PROJECTS_BY_ID: Record<string, Project> = Object.fromEntries(
  PROJECTS.map((project) => [project.id, project])
);

export const PROJECT_IDS = PROJECTS.map((project) => project.id);

export function isProjectId(id: string): boolean {
  return Object.hasOwn(PROJECTS_BY_ID, id);
}

export function getProject(id: string): Project | undefined {
  return PROJECTS_BY_ID[id];
}

export function getProjectsForCareer(careerId: string): Project[] {
  return PROJECTS.filter((project) => project.careerIds.includes(careerId));
}

export function getProjectsForLevel(
  projects: Project[],
  level: Project["level"]
): Project[] {
  return projects.filter((project) => project.level === level);
}
