import type { Career } from "@/types";

/**
 * Static career tracks used by the deterministic generator and as the fallback
 * whenever AI generation is unavailable. Every phase owns exactly five plan
 * days, so each career template covers the full 45-day roadmap.
 */
export const CAREERS: Career[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    tagline: "Ship products built on foundation models.",
    description:
      "AI Engineers turn language and vision models into reliable product features. You will learn the Python and data foundations first, then move through machine learning, deep learning, retrieval, agents and deployment until you can ship an LLM-powered application end to end.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "python", requiredLevel: 3, importance: "core" },
      { skillId: "numpy", requiredLevel: 2, importance: "supporting" },
      { skillId: "pandas", requiredLevel: 2, importance: "supporting" },
      { skillId: "sql", requiredLevel: 2, importance: "supporting" },
      { skillId: "machine-learning", requiredLevel: 2, importance: "core" },
      { skillId: "deep-learning", requiredLevel: 2, importance: "core" },
      { skillId: "pytorch", requiredLevel: 2, importance: "core" },
      { skillId: "generative-ai", requiredLevel: 3, importance: "core" },
      { skillId: "llm-prompting", requiredLevel: 3, importance: "core" },
      { skillId: "rag-systems", requiredLevel: 2, importance: "core" },
      { skillId: "agentic-ai", requiredLevel: 2, importance: "core" },
      { skillId: "docker", requiredLevel: 2, importance: "supporting" },
      { skillId: "git", requiredLevel: 2, importance: "supporting" },
      { skillId: "problem-solving", requiredLevel: 2, importance: "supporting" },
      { skillId: "system-design", requiredLevel: 1, importance: "bonus" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "python-foundations",
        order: 1,
        title: "Python Foundations",
        summary:
          "Get comfortable writing, running and version-controlling small Python programs.",
        kind: "foundation",
        dayCount: 5,
        skills: ["python", "git", "problem-solving"],
        topics: [
          "Python syntax, variables and data types",
          "Control flow, loops and functions",
          "Lists, dicts, sets and comprehensions",
          "Files, exceptions and virtual environments",
          "Mini CLI project with a clean Git history",
        ],
      },
      {
        id: "data-toolkit",
        order: 2,
        title: "The Data Toolkit",
        summary:
          "Load, clean, query and visualise real datasets with NumPy, Pandas and SQL.",
        kind: "tools",
        dayCount: 5,
        skills: [
          "numpy",
          "pandas",
          "data-cleaning",
          "sql",
          "data-visualization",
        ],
        topics: [
          "NumPy arrays and vectorised maths",
          "Pandas Series, DataFrames and indexing",
          "Cleaning messy data and handling nulls",
          "SQL SELECT, joins and aggregations",
          "Exploratory charts that answer a question",
        ],
      },
      {
        id: "ml-foundations",
        order: 3,
        title: "Machine Learning Foundations",
        summary:
          "Understand the core learning loop and train honest, well-evaluated models.",
        kind: "core",
        dayCount: 5,
        skills: [
          "machine-learning",
          "scikit-learn",
          "statistics",
          "model-evaluation",
          "feature-engineering",
        ],
        topics: [
          "Supervised versus unsupervised learning",
          "Train, validation and test splits without leakage",
          "Linear and logistic regression in scikit-learn",
          "Trees, random forests and gradient boosting",
          "Metrics, confusion matrices and error analysis",
        ],
      },
      {
        id: "deep-learning",
        order: 4,
        title: "Deep Learning",
        summary:
          "Build and train neural networks in PyTorch, then diagnose their failures.",
        kind: "core",
        dayCount: 5,
        skills: ["deep-learning", "pytorch", "model-evaluation", "numpy"],
        topics: [
          "Tensors, gradients and automatic differentiation",
          "Build a neural network from scratch",
          "Training loops, loss functions and optimisers",
          "Convolutional networks and transfer learning",
          "Debugging overfitting, underfitting and dead gradients",
        ],
      },
      {
        id: "generative-ai",
        order: 5,
        title: "Generative AI",
        summary:
          "Learn how transformer models behave and how to steer them with prompts.",
        kind: "advanced",
        dayCount: 5,
        skills: ["generative-ai", "llm-prompting", "nlp"],
        topics: [
          "How transformer language models work",
          "Tokenisation, embeddings and context windows",
          "Prompt patterns and structured outputs",
          "Function calling and JSON schemas",
          "Evaluating, guarding and costing model output",
        ],
      },
      {
        id: "llm-applications",
        order: 6,
        title: "LLM Applications",
        summary:
          "Ground model answers in your own data and serve them through a tested API.",
        kind: "advanced",
        dayCount: 5,
        skills: ["rag-systems", "api-design", "testing", "technical-writing"],
        topics: [
          "Chunking, embeddings and vector search",
          "Build a retrieval pipeline over real documents",
          "Ground answers and cite sources",
          "Streaming API routes, retries and rate limits",
          "Test and document an LLM service",
        ],
      },
      {
        id: "agentic-systems",
        order: 7,
        title: "Agentic Systems",
        summary:
          "Give models tools, memory and a plan — then make the behaviour observable.",
        kind: "advanced",
        dayCount: 5,
        skills: [
          "agentic-ai",
          "docker",
          "monitoring-observability",
          "communication",
        ],
        topics: [
          "Agent loops, tools and short-term memory",
          "Design safe, typed tool schemas",
          "Multi-step planning, retries and stop conditions",
          "Containerise the agent service",
          "Trace, log and evaluate agent runs",
        ],
      },
      {
        id: "portfolio-project",
        order: 8,
        title: "Portfolio Project",
        summary:
          "Ship one end-to-end AI product you can demo, explain and defend.",
        kind: "project",
        dayCount: 5,
        skills: ["portfolio-building", "nextjs", "rest-apis", "teamwork"],
        topics: [
          "Scope the capstone and write the spec",
          "Build the Next.js front end",
          "Ship the model API and connect it",
          "Add tests, docs and a demo script",
          "Publish the portfolio case study",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Practise the coding, ML and system-design rounds AI roles actually run.",
        kind: "interview",
        dayCount: 5,
        skills: [
          "interview-prep",
          "data-structures-algorithms",
          "system-design",
          "communication",
        ],
        topics: [
          "Python and SQL interview drills",
          "Machine learning fundamentals question bank",
          "Design an ML system out loud",
          "Behavioural stories with the STAR method",
          "Full mock interview and feedback loop",
        ],
      },
    ],
    projectIds: ["rag-study-assistant", "agentic-research-copilot"],
    levelGuidance: {
      beginner:
        "Start at the very beginning and keep the daily scope small. Do not skip the Python phase — every later week assumes it.",
      intermediate:
        "Skim the Python phase, spend your saved time on retrieval and agents, and stretch the capstone into a real deployment.",
      advanced:
        "Compress foundations into review days and use the extra focus on evaluation, cost control and production hardening.",
    },
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    tagline: "Answer hard questions with data and models.",
    description:
      "Data Scientists combine statistics, programming and communication to turn messy data into decisions. This track builds statistical intuition and modelling skill, then pushes into experiments, production models and the storytelling that gets findings acted on.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "python", requiredLevel: 3, importance: "core" },
      { skillId: "sql", requiredLevel: 3, importance: "core" },
      { skillId: "pandas", requiredLevel: 3, importance: "core" },
      { skillId: "numpy", requiredLevel: 2, importance: "supporting" },
      { skillId: "statistics", requiredLevel: 3, importance: "core" },
      { skillId: "data-visualization", requiredLevel: 2, importance: "core" },
      { skillId: "machine-learning", requiredLevel: 3, importance: "core" },
      { skillId: "scikit-learn", requiredLevel: 3, importance: "core" },
      { skillId: "feature-engineering", requiredLevel: 2, importance: "core" },
      { skillId: "model-evaluation", requiredLevel: 3, importance: "core" },
      { skillId: "a-b-testing", requiredLevel: 2, importance: "core" },
      { skillId: "communication", requiredLevel: 3, importance: "core" },
      { skillId: "technical-writing", requiredLevel: 2, importance: "supporting" },
      { skillId: "presentation", requiredLevel: 2, importance: "supporting" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "python-foundations",
        order: 1,
        title: "Python Foundations",
        summary:
          "Write clean Python and keep your analysis reproducible from day one.",
        kind: "foundation",
        dayCount: 5,
        skills: ["python", "git", "problem-solving"],
        topics: [
          "Variables, types and expressions",
          "Functions, modules and imports",
          "Collections and comprehensions",
          "Notebooks versus scripts, and virtual envs",
          "Reproducible project structure with Git",
        ],
      },
      {
        id: "statistics-core",
        order: 2,
        title: "Statistics Core",
        summary:
          "Build the statistical habits behind every credible analysis.",
        kind: "foundation",
        dayCount: 5,
        skills: ["statistics", "a-b-testing", "data-visualization"],
        topics: [
          "Descriptive statistics and distributions",
          "Sampling, bias and the central limit theorem",
          "Confidence intervals and hypothesis tests",
          "Choosing the right statistical test",
          "Visualising uncertainty honestly",
        ],
      },
      {
        id: "data-wrangling",
        order: 3,
        title: "Data Wrangling",
        summary:
          "Turn raw tables into a trustworthy analysis dataset with Pandas and SQL.",
        kind: "tools",
        dayCount: 5,
        skills: ["pandas", "numpy", "sql", "data-cleaning"],
        topics: [
          "Pandas indexing, filtering and assignment",
          "Group-bys, merges and reshaping",
          "SQL joins, CTEs and window functions",
          "Missing values, outliers and duplicate records",
          "Build a reusable cleaning pipeline",
        ],
      },
      {
        id: "ml-core",
        order: 4,
        title: "Machine Learning Core",
        summary:
          "Train, validate and explain classical models without fooling yourself.",
        kind: "core",
        dayCount: 5,
        skills: [
          "machine-learning",
          "scikit-learn",
          "feature-engineering",
          "model-evaluation",
        ],
        topics: [
          "The supervised learning workflow",
          "Feature engineering and encoding strategies",
          "Regression and regularisation",
          "Classification models and class imbalance",
          "Cross-validation and error analysis",
        ],
      },
      {
        id: "advanced-ml",
        order: 5,
        title: "Advanced Modelling",
        summary:
          "Reach for deep learning and NLP when the problem actually needs it.",
        kind: "advanced",
        dayCount: 5,
        skills: ["deep-learning", "nlp", "pytorch"],
        topics: [
          "When deep learning beats classical models",
          "Neural network basics in PyTorch",
          "Text cleaning, tokenisation and embeddings",
          "Fine-tuning versus prompting a language model",
          "Interpreting and stress-testing complex models",
        ],
      },
      {
        id: "experimentation",
        order: 6,
        title: "Experimentation",
        summary:
          "Design experiments, measure lift and connect results to product metrics.",
        kind: "advanced",
        dayCount: 5,
        skills: [
          "a-b-testing",
          "statistics",
          "product-metrics",
          "communication",
        ],
        topics: [
          "Framing a testable product hypothesis",
          "Power, sample size and guardrail metrics",
          "Running and monitoring an A/B test",
          "Interpreting lift, segments and novelty effects",
          "Writing an experiment readout stakeholders trust",
        ],
      },
      {
        id: "ml-in-production",
        order: 7,
        title: "Models in Production",
        summary:
          "Serve, monitor and maintain a model once it leaves your notebook.",
        kind: "advanced",
        dayCount: 5,
        skills: [
          "mlops",
          "docker",
          "api-design",
          "monitoring-observability",
        ],
        topics: [
          "From notebook to a tested training script",
          "Package a model behind a small API",
          "Containerise and deploy the service",
          "Monitor drift, latency and failure modes",
          "Version data, models and experiments",
        ],
      },
      {
        id: "portfolio-project",
        order: 8,
        title: "Portfolio Project",
        summary:
          "Deliver one analysis or model project with a crisp written narrative.",
        kind: "project",
        dayCount: 5,
        skills: [
          "portfolio-building",
          "technical-writing",
          "presentation",
          "teamwork",
        ],
        topics: [
          "Choose a dataset and define the decision it supports",
          "Complete the analysis and model baseline",
          "Validate results and document assumptions",
          "Write the README and methodology",
          "Record a five-minute project walkthrough",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Prepare for statistics screens, case studies and coding rounds.",
        kind: "interview",
        dayCount: 5,
        skills: [
          "interview-prep",
          "data-structures-algorithms",
          "system-design",
          "communication",
        ],
        topics: [
          "SQL and Python coding drills",
          "Statistics and probability rapid review",
          "Product analytics case practice",
          "Explain a past project in three minutes",
          "Mock interview and gap review",
        ],
      },
    ],
    projectIds: ["churn-prediction-lab", "experiment-analysis-toolkit"],
    levelGuidance: {
      beginner:
        "Do every foundation day and write down definitions in your own words. Strong statistics intuition pays off in every later phase.",
      intermediate:
        "Skim the Python basics, go deeper on experimentation and production, and make the capstone a real end-to-end case study.",
      advanced:
        "Use the foundation days to mentor yourself: rebuild a model you already know, then push into causal inference and deployment.",
    },
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    tagline: "Turn business questions into clear, trusted answers.",
    description:
      "Data Analysts are the people a team asks when a decision needs evidence. You will learn to query and clean data, build dashboards, run sound comparisons and present findings that change what a business does next — with a portfolio that proves it.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "excel", requiredLevel: 2, importance: "supporting" },
      { skillId: "sql", requiredLevel: 3, importance: "core" },
      { skillId: "data-cleaning", requiredLevel: 3, importance: "core" },
      { skillId: "statistics", requiredLevel: 2, importance: "core" },
      { skillId: "data-visualization", requiredLevel: 3, importance: "core" },
      { skillId: "tableau", requiredLevel: 2, importance: "core" },
      { skillId: "power-bi", requiredLevel: 2, importance: "supporting" },
      { skillId: "product-metrics", requiredLevel: 2, importance: "core" },
      { skillId: "a-b-testing", requiredLevel: 1, importance: "bonus" },
      { skillId: "communication", requiredLevel: 3, importance: "core" },
      { skillId: "presentation", requiredLevel: 2, importance: "core" },
      { skillId: "technical-writing", requiredLevel: 2, importance: "core" },
      { skillId: "portfolio-building", requiredLevel: 2, importance: "supporting" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "spreadsheet-sql-foundations",
        order: 1,
        title: "Spreadsheets & SQL Foundations",
        summary:
          "Get fluent with the two tools every analyst opens first.",
        kind: "foundation",
        dayCount: 5,
        skills: ["excel", "sql", "problem-solving"],
        topics: [
          "Excel formulas, references and pivot tables",
          "Spreadsheet modelling and what-if analysis",
          "SQL SELECT, WHERE and ORDER BY",
          "Joins, GROUP BY and aggregate functions",
          "Subqueries and common table expressions",
        ],
      },
      {
        id: "data-cleaning",
        order: 2,
        title: "Data Cleaning",
        summary:
          "Diagnose messy data and document every decision you make about it.",
        kind: "tools",
        dayCount: 5,
        skills: ["data-cleaning", "pandas", "data-modeling"],
        topics: [
          "Profiling a new dataset",
          "Missing values, duplicates and type fixes",
          "Standardising categories and date formats",
          "Joining sources without inflating row counts",
          "Write a cleaning log others can follow",
        ],
      },
      {
        id: "analytics-toolkit",
        order: 3,
        title: "Analytics Toolkit",
        summary:
          "Build charts and dashboards in Tableau and Power BI that people use.",
        kind: "tools",
        dayCount: 5,
        skills: ["tableau", "power-bi", "data-visualization"],
        topics: [
          "Chart choice and visual hierarchy",
          "Tableau worksheets, filters and parameters",
          "Power BI data model and relationships",
          "Designing a dashboard for one decision",
          "Publishing and sharing responsibly",
        ],
      },
      {
        id: "statistics-for-analysts",
        order: 4,
        title: "Statistics for Analysts",
        summary:
          "Compare groups, quantify uncertainty and avoid the classic traps.",
        kind: "core",
        dayCount: 5,
        skills: ["statistics", "a-b-testing"],
        topics: [
          "Averages, spread and misleading summaries",
          "Sampling and statistical significance",
          "Correlation, causation and confounders",
          "Reading an A/B test result",
          "Communicating uncertainty to non-analysts",
        ],
      },
      {
        id: "business-metrics",
        order: 5,
        title: "Business Metrics",
        summary:
          "Connect the data model to the numbers a business actually manages.",
        kind: "core",
        dayCount: 5,
        skills: ["product-metrics", "communication", "problem-solving"],
        topics: [
          "Funnels, cohorts and retention",
          "Defining a metric so everyone agrees",
          "Revenue, unit economics and margin basics",
          "Root-cause analysis when a metric moves",
          "Writing a crisp insight memo",
        ],
      },
      {
        id: "dashboarding",
        order: 6,
        title: "Dashboard Delivery",
        summary:
          "Ship a reliable dashboard with a documented model behind it.",
        kind: "core",
        dayCount: 5,
        skills: [
          "data-visualization",
          "tableau",
          "data-modeling",
          "technical-writing",
        ],
        topics: [
          "Sketch the dashboard before you build it",
          "Build the underlying data model",
          "Add interactivity without clutter",
          "Validate numbers against the source",
          "Document definitions and refresh expectations",
        ],
      },
      {
        id: "insights-storytelling",
        order: 7,
        title: "Insights & Storytelling",
        summary:
          "Turn an analysis into a recommendation someone acts on.",
        kind: "advanced",
        dayCount: 5,
        skills: ["presentation", "communication", "technical-writing"],
        topics: [
          "Structure: answer first, then evidence",
          "Designing slides for a decision meeting",
          "Handling pushback and data questions",
          "Writing the one-page executive summary",
          "Rehearse a five-minute readout",
        ],
      },
      {
        id: "portfolio-project",
        order: 8,
        title: "Portfolio Project",
        summary:
          "Publish a dashboard and write-up that shows your full workflow.",
        kind: "project",
        dayCount: 5,
        skills: ["portfolio-building", "tableau", "presentation"],
        topics: [
          "Pick a dataset with a real business question",
          "Clean and model the data",
          "Build the final dashboard",
          "Write the insight narrative",
          "Publish and polish the portfolio entry",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Practise SQL screens, take-home analyses and stakeholder cases.",
        kind: "interview",
        dayCount: 5,
        skills: ["interview-prep", "sql", "communication", "problem-solving"],
        topics: [
          "SQL interview question patterns",
          "Take-home analysis checklist",
          "Metrics and case interview practice",
          "Behavioural questions for analysts",
          "Timed mock interview",
        ],
      },
    ],
    projectIds: ["sales-insights-dashboard", "marketing-funnel-analysis"],
    levelGuidance: {
      beginner:
        "Do not rush SQL — every project depends on it. Repeat each query by hand before using a shortcut.",
      intermediate:
        "Move quickly through Excel and chart basics; invest the extra days in metric design and executive communication.",
      advanced:
        "Use the early days to formalise habits, then focus on dashboard performance, data modelling and mentoring-style documentation.",
    },
  },
  {
    id: "full-stack-developer",
    title: "Full-Stack Developer",
    tagline: "Build and ship complete web products.",
    description:
      "Full-Stack Developers own a feature from database to pixel. This track covers semantic HTML and CSS, TypeScript, React and Next.js, backend APIs, data modelling, authentication and deployment — finishing with a capstone and interview practice.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "html-css", requiredLevel: 3, importance: "core" },
      { skillId: "javascript", requiredLevel: 3, importance: "core" },
      { skillId: "typescript", requiredLevel: 3, importance: "core" },
      { skillId: "react", requiredLevel: 3, importance: "core" },
      { skillId: "nextjs", requiredLevel: 2, importance: "core" },
      { skillId: "nodejs", requiredLevel: 2, importance: "core" },
      { skillId: "rest-apis", requiredLevel: 2, importance: "core" },
      { skillId: "databases", requiredLevel: 2, importance: "core" },
      { skillId: "sql", requiredLevel: 2, importance: "supporting" },
      { skillId: "api-design", requiredLevel: 2, importance: "core" },
      { skillId: "authentication", requiredLevel: 2, importance: "supporting" },
      { skillId: "git", requiredLevel: 2, importance: "core" },
      { skillId: "docker", requiredLevel: 1, importance: "supporting" },
      { skillId: "testing", requiredLevel: 2, importance: "core" },
      { skillId: "system-design", requiredLevel: 1, importance: "bonus" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "web-foundations",
        order: 1,
        title: "Web Foundations",
        summary:
          "Learn the platform: semantic markup, layout, responsiveness and Git.",
        kind: "foundation",
        dayCount: 5,
        skills: ["html-css", "responsive-design", "accessibility", "git"],
        topics: [
          "Semantic HTML and document structure",
          "CSS layout with flexbox and grid",
          "Responsive breakpoints and fluid type",
          "Accessibility basics and keyboard testing",
          "Git branching and a clean commit history",
        ],
      },
      {
        id: "javascript-typescript",
        order: 2,
        title: "JavaScript & TypeScript",
        summary:
          "Build real logic in JavaScript, then make it safe with TypeScript.",
        kind: "foundation",
        dayCount: 5,
        skills: ["javascript", "typescript", "problem-solving"],
        topics: [
          "Values, scope, closures and the event loop",
          "Arrays, objects and functional helpers",
          "Async JavaScript, promises and fetch",
          "TypeScript types, unions and generics",
          "Type-safe data parsing at the boundary",
        ],
      },
      {
        id: "react-frontend",
        order: 3,
        title: "React Frontend",
        summary:
          "Build composable interfaces with state, effects and modern patterns.",
        kind: "core",
        dayCount: 5,
        skills: ["react", "nextjs", "state-management", "responsive-design"],
        topics: [
          "Components, props and rendering",
          "State, events and controlled inputs",
          "Effects, data fetching and error states",
          "Next.js routing, layouts and server components",
          "Client versus server state boundaries",
        ],
      },
      {
        id: "backend-apis",
        order: 4,
        title: "Backend & APIs",
        summary:
          "Design and implement the server side of a product feature.",
        kind: "core",
        dayCount: 5,
        skills: ["nodejs", "rest-apis", "api-design", "authentication"],
        topics: [
          "Node.js modules and a minimal HTTP server",
          "Route handlers, validation and status codes",
          "API design, pagination and versioning",
          "Sessions, tokens and OAuth basics",
          "Authorisation and safe error responses",
        ],
      },
      {
        id: "databases",
        order: 5,
        title: "Databases",
        summary:
          "Model data properly and query it without N+1 surprises.",
        kind: "core",
        dayCount: 5,
        skills: ["databases", "sql", "data-modeling", "orm"],
        topics: [
          "Relational modelling and normalisation",
          "SQL reads, writes, joins and indexes",
          "Transactions and consistency",
          "Typed access with an ORM",
          "Migrations and seed data",
        ],
      },
      {
        id: "testing-deployment",
        order: 6,
        title: "Testing & Deployment",
        summary:
          "Make the product reliable, then put it on the internet.",
        kind: "core",
        dayCount: 5,
        skills: ["testing", "ci-cd", "docker", "web-performance"],
        topics: [
          "Unit tests for pure logic",
          "Integration tests for API routes",
          "End-to-end tests for critical flows",
          "Containerise the app and wire a CI pipeline",
          "Measure and improve Core Web Vitals",
        ],
      },
      {
        id: "full-stack-capstone",
        order: 7,
        title: "Full-Stack Capstone",
        summary:
          "Ship one product feature set end to end with a deployed URL.",
        kind: "project",
        dayCount: 5,
        skills: [
          "nextjs",
          "react",
          "nodejs",
          "databases",
          "portfolio-building",
        ],
        topics: [
          "Write the spec and sketch the data model",
          "Build the core UI and routing",
          "Implement the API and persistence",
          "Add auth, tests and error handling",
          "Deploy, document and record a demo",
        ],
      },
      {
        id: "production-readiness",
        order: 8,
        title: "Production Readiness",
        summary:
          "Understand the operational and security concerns behind a live app.",
        kind: "advanced",
        dayCount: 5,
        skills: [
          "monitoring-observability",
          "system-design",
          "cloud-security",
          "communication",
        ],
        topics: [
          "Logging, metrics and error tracking",
          "Caching, queues and background jobs",
          "Design a scalable web architecture",
          "Secrets, least privilege and common web attacks",
          "Write a production readiness checklist",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Practise coding rounds, frontend deep dives and system design.",
        kind: "interview",
        dayCount: 5,
        skills: [
          "interview-prep",
          "data-structures-algorithms",
          "system-design",
          "teamwork",
        ],
        topics: [
          "Array, string and hash-map drills",
          "JavaScript and React concept questions",
          "Design a read-heavy web app",
          "Walk through your capstone architecture",
          "Mock interview and code review feedback",
        ],
      },
    ],
    projectIds: ["collaborative-task-board", "full-stack-notes-app"],
    levelGuidance: {
      beginner:
        "Type every example yourself and keep one small project open all week. Do not copy-paste UI that you cannot rebuild.",
      intermediate:
        "Move fast through HTML and JS basics, then spend the saved time on data modelling, testing and deployment.",
      advanced:
        "Treat foundation days as review plus mentoring notes, and push the capstone toward real users and performance budgets.",
    },
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    tagline: "Put models into production and keep them healthy.",
    description:
      "ML Engineers bridge data science and software engineering. You will build training pipelines, train deep models, deploy them behind APIs, and operate them on cloud infrastructure with monitoring, versioning and cost control.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "python", requiredLevel: 3, importance: "core" },
      { skillId: "numpy", requiredLevel: 2, importance: "supporting" },
      { skillId: "pandas", requiredLevel: 2, importance: "supporting" },
      { skillId: "machine-learning", requiredLevel: 3, importance: "core" },
      { skillId: "deep-learning", requiredLevel: 3, importance: "core" },
      { skillId: "pytorch", requiredLevel: 3, importance: "core" },
      { skillId: "tensorflow", requiredLevel: 2, importance: "supporting" },
      { skillId: "mlops", requiredLevel: 3, importance: "core" },
      { skillId: "docker", requiredLevel: 2, importance: "core" },
      { skillId: "kubernetes", requiredLevel: 2, importance: "core" },
      { skillId: "aws", requiredLevel: 2, importance: "core" },
      { skillId: "model-evaluation", requiredLevel: 3, importance: "core" },
      { skillId: "feature-engineering", requiredLevel: 2, importance: "core" },
      { skillId: "system-design", requiredLevel: 2, importance: "supporting" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "python-ml-foundations",
        order: 1,
        title: "Python & ML Foundations",
        summary:
          "Rebuild the Python and data habits that production ML depends on.",
        kind: "foundation",
        dayCount: 5,
        skills: ["python", "numpy", "pandas", "git"],
        topics: [
          "Python data structures and typing",
          "NumPy vectorisation and broadcasting",
          "Pandas pipelines for tabular data",
          "Clean project layout and environments",
          "Git workflow for experiments",
        ],
      },
      {
        id: "ml-algorithms",
        order: 2,
        title: "ML Algorithms",
        summary:
          "Understand the models you will later tune, serve and debug.",
        kind: "core",
        dayCount: 5,
        skills: [
          "machine-learning",
          "scikit-learn",
          "feature-engineering",
          "model-evaluation",
        ],
        topics: [
          "Learning theory in practice: bias and variance",
          "Linear models and regularisation",
          "Tree ensembles and boosting",
          "Feature pipelines and leakage prevention",
          "Cross-validation, metrics and slices",
        ],
      },
      {
        id: "deep-learning",
        order: 3,
        title: "Deep Learning",
        summary:
          "Train neural networks and know why they fail.",
        kind: "core",
        dayCount: 5,
        skills: ["deep-learning", "pytorch", "statistics"],
        topics: [
          "Tensors, autograd and computation graphs",
          "Datasets, dataloaders and batching",
          "Optimisers, schedulers and regularisation",
          "Transfer learning for a real dataset",
          "Diagnose training curves and failures",
        ],
      },
      {
        id: "data-at-scale",
        order: 4,
        title: "Data at Scale",
        summary:
          "Build the pipelines that feed training and evaluation.",
        kind: "tools",
        dayCount: 5,
        skills: ["etl-pipelines", "data-modeling", "sql", "docker"],
        topics: [
          "Batch ETL design and idempotency",
          "SQL for feature extraction",
          "Train, validation and test splits at scale",
          "Reproducible data snapshots",
          "Containerise the pipeline",
        ],
      },
      {
        id: "model-deployment",
        order: 5,
        title: "Model Deployment",
        summary:
          "Serve a model with latency, reliability and rollback in mind.",
        kind: "advanced",
        dayCount: 5,
        skills: ["mlops", "rest-apis", "api-design", "monitoring-observability"],
        topics: [
          "Model artefact formats and versioning",
          "Batch versus real-time serving",
          "Build a prediction API with validation",
          "Load testing, batching and autoscaling",
          "Monitor latency, drift and data quality",
        ],
      },
      {
        id: "cloud-ml-infrastructure",
        order: 6,
        title: "Cloud ML Infrastructure",
        summary:
          "Run training and serving on managed cloud infrastructure.",
        kind: "advanced",
        dayCount: 5,
        skills: ["aws", "kubernetes", "terraform", "cloud-security"],
        topics: [
          "Core AWS services for ML workloads",
          "IAM roles, secrets and least privilege",
          "Deploy a service to Kubernetes",
          "Infrastructure as code with Terraform",
          "Cost, quotas and capacity planning",
        ],
      },
      {
        id: "distributed-training",
        order: 7,
        title: "Scaling Training",
        summary:
          "Use the right accelerators and frameworks when one machine is not enough.",
        kind: "advanced",
        dayCount: 5,
        skills: ["tensorflow", "pytorch", "docker", "monitoring-observability"],
        topics: [
          "GPU basics and memory budgeting",
          "Mixed precision and gradient accumulation",
          "Distributed data-parallel training",
          "Experiment tracking and reproducibility",
          "Profile and remove training bottlenecks",
        ],
      },
      {
        id: "portfolio-project",
        order: 8,
        title: "Portfolio Project",
        summary:
          "Publish an end-to-end ML system with metrics and an architecture diagram.",
        kind: "project",
        dayCount: 5,
        skills: [
          "portfolio-building",
          "technical-writing",
          "teamwork",
          "presentation",
        ],
        topics: [
          "Define the problem, metric and constraints",
          "Build the training and evaluation pipeline",
          "Deploy the inference service",
          "Add monitoring and a model card",
          "Write the case study and record a demo",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Prepare for ML coding, ML system design and behavioural rounds.",
        kind: "interview",
        dayCount: 5,
        skills: [
          "interview-prep",
          "data-structures-algorithms",
          "system-design",
          "communication",
        ],
        topics: [
          "Python and data-structure drills",
          "ML theory rapid-fire review",
          "Design an end-to-end ML system",
          "Explain trade-offs in your capstone",
          "Mock interview and feedback loop",
        ],
      },
    ],
    projectIds: ["ml-model-serving-platform", "vision-quality-inspector"],
    levelGuidance: {
      beginner:
        "Keep the math practical: implement a small version of each concept before using a library shortcut.",
      intermediate:
        "Compress the first two phases and invest in deployment, infrastructure and monitoring — that is what separates ML engineers.",
      advanced:
        "Use foundation days for review notes, then push into distributed training, cost optimisation and reliability engineering.",
    },
  },
  {
    id: "devops-cloud-engineer",
    title: "DevOps / Cloud Engineer",
    tagline: "Make software deployable, observable and resilient.",
    description:
      "DevOps and Cloud Engineers own the path from commit to production. This track starts with Linux and networking, then moves through scripting, containers, cloud platforms, infrastructure as code, CI/CD, observability and reliability.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "linux", requiredLevel: 3, importance: "core" },
      { skillId: "networking", requiredLevel: 2, importance: "core" },
      { skillId: "bash-scripting", requiredLevel: 3, importance: "core" },
      { skillId: "git", requiredLevel: 2, importance: "core" },
      { skillId: "docker", requiredLevel: 3, importance: "core" },
      { skillId: "kubernetes", requiredLevel: 2, importance: "core" },
      { skillId: "aws", requiredLevel: 2, importance: "core" },
      { skillId: "terraform", requiredLevel: 2, importance: "core" },
      { skillId: "ci-cd", requiredLevel: 2, importance: "core" },
      { skillId: "monitoring-observability", requiredLevel: 2, importance: "core" },
      { skillId: "cloud-security", requiredLevel: 2, importance: "core" },
      { skillId: "system-design", requiredLevel: 2, importance: "supporting" },
      { skillId: "problem-solving", requiredLevel: 3, importance: "core" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "linux-networking",
        order: 1,
        title: "Linux & Networking",
        summary:
          "Get comfortable on a server and understand how packets reach it.",
        kind: "foundation",
        dayCount: 5,
        skills: ["linux", "networking", "problem-solving"],
        topics: [
          "Filesystem, permissions and processes",
          "Users, services and system logs",
          "TCP/IP, DNS and HTTP fundamentals",
          "Subnets, firewalls and load balancing",
          "Diagnose a broken service from the CLI",
        ],
      },
      {
        id: "scripting-automation",
        order: 2,
        title: "Scripting & Automation",
        summary:
          "Automate repetitive operations safely and reviewably.",
        kind: "foundation",
        dayCount: 5,
        skills: ["bash-scripting", "python", "git"],
        topics: [
          "Bash variables, conditionals and loops",
          "Pipes, text processing and exit codes",
          "Robust scripts with error handling",
          "Python for operational tooling",
          "Version control and reviewed automation",
        ],
      },
      {
        id: "containers",
        order: 3,
        title: "Containers",
        summary:
          "Package services into images and orchestrate them with Kubernetes.",
        kind: "core",
        dayCount: 5,
        skills: ["docker", "kubernetes", "linux"],
        topics: [
          "Images, layers and multi-stage builds",
          "Volumes, networks and health checks",
          "Kubernetes pods, deployments and services",
          "ConfigMaps, secrets and resource limits",
          "Debug a failing rollout",
        ],
      },
      {
        id: "cloud-platforms",
        order: 4,
        title: "Cloud Platforms",
        summary:
          "Learn the shared primitives of AWS, GCP and Azure — and secure them.",
        kind: "core",
        dayCount: 5,
        skills: ["aws", "gcp", "azure", "cloud-security"],
        topics: [
          "Compute, storage and networking primitives",
          "Identity, IAM and least privilege",
          "Managed databases and queues",
          "Comparing AWS, GCP and Azure services",
          "Secure a small cloud environment",
        ],
      },
      {
        id: "infrastructure-as-code",
        order: 5,
        title: "Infrastructure as Code",
        summary:
          "Define infrastructure in versioned, reviewed Terraform.",
        kind: "core",
        dayCount: 5,
        skills: ["terraform", "ci-cd", "git"],
        topics: [
          "Terraform state, providers and modules",
          "Plan, apply and drift detection",
          "Reusable environments for dev and prod",
          "CI pipelines that build, test and deploy",
          "Secrets, approvals and rollbacks",
        ],
      },
      {
        id: "observability",
        order: 6,
        title: "Observability",
        summary:
          "Instrument a service so failures are visible before users report them.",
        kind: "advanced",
        dayCount: 5,
        skills: ["monitoring-observability", "linux", "docker"],
        topics: [
          "Metrics, logs and traces explained",
          "Prometheus metrics and alert rules",
          "Centralised logging and dashboards",
          "Service level indicators and objectives",
          "Run a small incident review",
        ],
      },
      {
        id: "reliability-security",
        order: 7,
        title: "Reliability & Security",
        summary:
          "Design for failure and keep the platform defensible.",
        kind: "advanced",
        dayCount: 5,
        skills: [
          "cloud-security",
          "network-security",
          "incident-response",
          "system-design",
        ],
        topics: [
          "Backups, restore drills and disaster recovery",
          "High availability and graceful degradation",
          "Threat modelling a deployment pipeline",
          "Patch management and vulnerability response",
          "Design a resilient multi-service platform",
        ],
      },
      {
        id: "capstone",
        order: 8,
        title: "Platform Capstone",
        summary:
          "Deliver a reproducible platform another engineer can stand up.",
        kind: "project",
        dayCount: 5,
        skills: [
          "portfolio-building",
          "terraform",
          "kubernetes",
          "technical-writing",
        ],
        topics: [
          "Scope the platform and draw the architecture",
          "Provision the cloud foundation with Terraform",
          "Deploy the app to Kubernetes",
          "Add CI/CD, monitoring and alerts",
          "Write the runbook and publish the repo",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Practise troubleshooting, system design and Linux screens.",
        kind: "interview",
        dayCount: 5,
        skills: [
          "interview-prep",
          "system-design",
          "communication",
          "problem-solving",
        ],
        topics: [
          "Linux and networking troubleshooting drills",
          "Kubernetes and Docker question bank",
          "Design a CI/CD platform out loud",
          "Explain an incident you handled",
          "Mock interview and gap review",
        ],
      },
    ],
    projectIds: ["kubernetes-platform-blueprint", "ci-cd-pipeline-template"],
    levelGuidance: {
      beginner:
        "Spend real time on the Linux command line. Everything later assumes you can navigate a server without a GUI.",
      intermediate:
        "Move fast through Linux basics and put the saved days into Kubernetes, Terraform modules and incident response.",
      advanced:
        "Use foundation days to document best practices, then focus on multi-cloud trade-offs, reliability and platform design.",
    },
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    tagline: "Detect, investigate and contain threats.",
    description:
      "Cybersecurity Analysts defend systems by understanding how they break. This track covers networking and Linux, security fundamentals, threat detection, SIEM analysis, incident response, vulnerability management and the governance work employers expect.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "networking", requiredLevel: 3, importance: "core" },
      { skillId: "linux", requiredLevel: 2, importance: "core" },
      { skillId: "network-security", requiredLevel: 3, importance: "core" },
      { skillId: "threat-analysis", requiredLevel: 3, importance: "core" },
      { skillId: "siem", requiredLevel: 2, importance: "core" },
      { skillId: "incident-response", requiredLevel: 3, importance: "core" },
      { skillId: "vulnerability-management", requiredLevel: 2, importance: "core" },
      { skillId: "cryptography", requiredLevel: 2, importance: "supporting" },
      { skillId: "penetration-testing", requiredLevel: 1, importance: "bonus" },
      { skillId: "security-compliance", requiredLevel: 2, importance: "core" },
      { skillId: "communication", requiredLevel: 3, importance: "core" },
      { skillId: "technical-writing", requiredLevel: 2, importance: "core" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "networking-fundamentals",
        order: 1,
        title: "Networking Fundamentals",
        summary:
          "Learn how traffic moves so you can tell normal from malicious.",
        kind: "foundation",
        dayCount: 5,
        skills: ["networking", "linux", "problem-solving"],
        topics: [
          "OSI and TCP/IP models in practice",
          "IP addressing, subnets and routing",
          "DNS, DHCP and common protocols",
          "Reading packets in Wireshark",
          "Linux networking commands and logs",
        ],
      },
      {
        id: "security-foundations",
        order: 2,
        title: "Security Foundations",
        summary:
          "Understand the attacker's goals and the controls that stop them.",
        kind: "foundation",
        dayCount: 5,
        skills: ["network-security", "cryptography", "security-compliance"],
        topics: [
          "CIA triad, risk and threat actors",
          "Authentication, authorisation and MFA",
          "Hashing, encryption and TLS",
          "Firewalls, segmentation and zero trust",
          "Security frameworks and control mapping",
        ],
      },
      {
        id: "threat-detection",
        order: 3,
        title: "Threat Detection",
        summary:
          "Recognise attacker techniques and turn them into detections.",
        kind: "core",
        dayCount: 5,
        skills: ["threat-analysis", "siem", "linux"],
        topics: [
          "MITRE ATT&CK and the kill chain",
          "Common web and credential attacks",
          "Indicators of compromise and log sources",
          "Write a detection rule",
          "Tune noisy alerts",
        ],
      },
      {
        id: "incident-response",
        order: 4,
        title: "Incident Response",
        summary:
          "Work an incident from first alert to written post-mortem.",
        kind: "core",
        dayCount: 5,
        skills: ["incident-response", "threat-analysis", "communication"],
        topics: [
          "The incident response lifecycle",
          "Triage, severity and escalation",
          "Containment, eradication and recovery",
          "Evidence handling and chain of custody",
          "Write a blameless post-mortem",
        ],
      },
      {
        id: "vulnerability-management",
        order: 5,
        title: "Vulnerability Management",
        summary:
          "Find weaknesses, rank them by real risk and drive fixes.",
        kind: "core",
        dayCount: 5,
        skills: ["vulnerability-management", "penetration-testing", "networking"],
        topics: [
          "Scanning and asset inventory",
          "CVE, CVSS and exploitability",
          "Web vulnerability classes and safe testing",
          "Prioritising remediation with the business",
          "Track fixes to closure",
        ],
      },
      {
        id: "security-operations",
        order: 6,
        title: "Security Operations",
        summary:
          "Run detection and monitoring across cloud and on-prem systems.",
        kind: "advanced",
        dayCount: 5,
        skills: ["siem", "monitoring-observability", "cloud-security"],
        topics: [
          "SIEM queries and correlation rules",
          "Cloud audit logs and identity signals",
          "Endpoint and network telemetry",
          "Dashboards for a SOC shift",
          "Automate a repeatable response step",
        ],
      },
      {
        id: "governance",
        order: 7,
        title: "Governance & Communication",
        summary:
          "Translate security risk into language leadership can act on.",
        kind: "advanced",
        dayCount: 5,
        skills: ["security-compliance", "technical-writing", "communication"],
        topics: [
          "Policy, standards and control ownership",
          "Risk registers and treatment options",
          "Privacy, data handling and retention",
          "Brief a non-technical executive",
          "Write a security assessment report",
        ],
      },
      {
        id: "capstone",
        order: 8,
        title: "Security Capstone",
        summary:
          "Build a home SOC lab and document a full investigation.",
        kind: "project",
        dayCount: 5,
        skills: [
          "portfolio-building",
          "penetration-testing",
          "technical-writing",
          "presentation",
        ],
        topics: [
          "Design the lab and pick a scenario",
          "Stand up logging and detection",
          "Simulate an attack in a safe environment",
          "Investigate, contain and document",
          "Publish the report and demo",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Practise SOC scenarios, technical screens and behavioural rounds.",
        kind: "interview",
        dayCount: 5,
        skills: [
          "interview-prep",
          "threat-analysis",
          "communication",
          "problem-solving",
        ],
        topics: [
          "Networking and Linux rapid review",
          "SOC alert triage scenarios",
          "Explain a breach and the response",
          "Behavioural questions with STAR",
          "Mock interview and feedback loop",
        ],
      },
    ],
    projectIds: ["home-soc-lab", "vulnerability-report-portfolio"],
    levelGuidance: {
      beginner:
        "Build the networking mental model slowly and practise commands in a safe VM. Security vocabulary without the basics will not stick.",
      intermediate:
        "Skim networking and Linux, then go deep on detection engineering, incident response and cloud identity.",
      advanced:
        "Use early days to produce reference notes, and spend the rest on automation, threat hunting and executive communication.",
    },
  },
  {
    id: "product-manager",
    title: "Product Manager",
    tagline: "Decide what to build — and why it matters.",
    description:
      "Product Managers connect user problems, business goals and engineering reality. This track builds discovery and strategy skills, then roadmapping, metrics, delivery and stakeholder communication, ending with a portfolio case study and interview practice.",
    estimatedDays: 45,
    coreSkills: [
      { skillId: "product-strategy", requiredLevel: 3, importance: "core" },
      { skillId: "user-research", requiredLevel: 3, importance: "core" },
      { skillId: "roadmapping", requiredLevel: 3, importance: "core" },
      { skillId: "prioritization", requiredLevel: 3, importance: "core" },
      { skillId: "product-metrics", requiredLevel: 2, importance: "core" },
      { skillId: "stakeholder-management", requiredLevel: 3, importance: "core" },
      { skillId: "wireframing", requiredLevel: 2, importance: "core" },
      { skillId: "agile-scrum", requiredLevel: 2, importance: "core" },
      { skillId: "communication", requiredLevel: 3, importance: "core" },
      { skillId: "presentation", requiredLevel: 3, importance: "core" },
      { skillId: "problem-solving", requiredLevel: 3, importance: "core" },
      { skillId: "statistics", requiredLevel: 1, importance: "bonus" },
      { skillId: "portfolio-building", requiredLevel: 2, importance: "supporting" },
      { skillId: "interview-prep", requiredLevel: 2, importance: "bonus" },
    ],
    phases: [
      {
        id: "product-foundations",
        order: 1,
        title: "Product Foundations",
        summary:
          "Learn what a PM is accountable for and how products create value.",
        kind: "foundation",
        dayCount: 5,
        skills: ["product-strategy", "communication", "problem-solving"],
        topics: [
          "What product managers actually own",
          "Value creation and business models",
          "User problems versus feature requests",
          "Writing a clear problem statement",
          "The product lifecycle and stage gates",
        ],
      },
      {
        id: "user-research",
        order: 2,
        title: "User Research",
        summary:
          "Talk to users without leading them, then synthesise what you hear.",
        kind: "core",
        dayCount: 5,
        skills: ["user-research", "wireframing", "communication"],
        topics: [
          "Writing a research plan and screener",
          "Running a non-leading interview",
          "Usability testing a flow",
          "Synthesising notes into themes",
          "Sketching a low-fidelity solution",
        ],
      },
      {
        id: "strategy-discovery",
        order: 3,
        title: "Strategy & Discovery",
        summary:
          "Choose the right problem and the sharpest wedge into it.",
        kind: "core",
        dayCount: 5,
        skills: ["product-strategy", "prioritization", "problem-solving"],
        topics: [
          "Market and competitor mapping",
          "Opportunity sizing and assumptions",
          "Jobs-to-be-done and user segments",
          "Prioritisation with RICE and opportunity scores",
          "Write a one-page product strategy",
        ],
      },
      {
        id: "roadmapping",
        order: 4,
        title: "Roadmapping",
        summary:
          "Turn strategy into a sequenced, defensible plan.",
        kind: "core",
        dayCount: 5,
        skills: ["roadmapping", "prioritization", "agile-scrum"],
        topics: [
          "Outcome roadmaps versus feature lists",
          "Now, next, later and confidence levels",
          "Breaking outcomes into milestones",
          "Sprint planning and backlog refinement",
          "Communicating trade-offs and cuts",
        ],
      },
      {
        id: "metrics-analytics",
        order: 5,
        title: "Metrics & Analytics",
        summary:
          "Define success, instrument it and read the results honestly.",
        kind: "core",
        dayCount: 5,
        skills: ["product-metrics", "statistics", "data-visualization"],
        topics: [
          "North-star and guardrail metrics",
          "Funnels, cohorts and retention curves",
          "Instrumentation and event taxonomy",
          "Reading an experiment result",
          "Build a one-page metrics dashboard",
        ],
      },
      {
        id: "design-delivery",
        order: 6,
        title: "Design & Delivery",
        summary:
          "Work with design and engineering to ship the smallest useful thing.",
        kind: "core",
        dayCount: 5,
        skills: ["wireframing", "agile-scrum", "teamwork"],
        topics: [
          "Writing a crisp product requirement",
          "Working with designers on flows",
          "Estimating, slicing and sequencing work",
          "Running a sprint review and retro",
          "Handling scope change mid-sprint",
        ],
      },
      {
        id: "launch-stakeholders",
        order: 7,
        title: "Launch & Stakeholders",
        summary:
          "Coordinate a launch and keep every stakeholder aligned.",
        kind: "advanced",
        dayCount: 5,
        skills: ["stakeholder-management", "presentation", "technical-writing"],
        topics: [
          "Stakeholder mapping and influence",
          "Launch tiers, checklist and rollback plan",
          "Positioning and internal enablement",
          "Presenting a decision to leadership",
          "Write the launch retrospective",
        ],
      },
      {
        id: "portfolio-project",
        order: 8,
        title: "Portfolio Project",
        summary:
          "Produce a complete product case study you can defend in interviews.",
        kind: "project",
        dayCount: 5,
        skills: [
          "portfolio-building",
          "product-strategy",
          "presentation",
          "technical-writing",
        ],
        topics: [
          "Pick a product and frame the problem",
          "Run lightweight research and synthesis",
          "Define the strategy, metrics and roadmap",
          "Sketch the solution and delivery plan",
          "Publish the case study and a short pitch",
        ],
      },
      {
        id: "interview-prep",
        order: 9,
        title: "Interview Preparation",
        summary:
          "Practise product sense, analytics and behavioural interviews.",
        kind: "interview",
        dayCount: 5,
        skills: [
          "interview-prep",
          "product-metrics",
          "communication",
          "problem-solving",
        ],
        topics: [
          "Product sense question framework",
          "Metrics and estimation drills",
          "Prioritisation and trade-off cases",
          "Behavioural stories with STAR",
          "Full mock interview and feedback",
        ],
      },
    ],
    projectIds: ["campus-events-product-spec", "subscription-retention-teardown"],
    levelGuidance: {
      beginner:
        "Practise writing and speaking every day. PM interviews reward clear reasoning more than memorised frameworks.",
      intermediate:
        "Skim the foundations and invest in research synthesis, metrics and launch communication.",
      advanced:
        "Use foundation days to sharpen your writing, then focus on portfolio depth, strategy trade-offs and executive presence.",
    },
  },
];

export const CAREERS_BY_ID: Record<string, Career> = Object.fromEntries(
  CAREERS.map((career) => [career.id, career])
);

export const CAREER_IDS = CAREERS.map((career) => career.id);

export function isCareerId(id: string): boolean {
  return Object.hasOwn(CAREERS_BY_ID, id);
}

export function getCareer(id: string): Career | undefined {
  return CAREERS_BY_ID[id];
}

export function getCareerOrThrow(id: string): Career {
  const career = CAREERS_BY_ID[id];
  if (!career) {
    throw new Error(`Unknown career id "${id}"`);
  }
  return career;
}
