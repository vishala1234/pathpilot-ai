import type { Skill, SkillCategory } from "@/types";

/**
 * Every skill PathPilot knows about. Careers reference these by id, and the
 * skill-gap engine only ever looks at this list — so ids are the contract.
 */
type SkillDefinition = readonly [
  id: string,
  name: string,
  category: SkillCategory,
  description: string,
  aliases?: readonly string[],
];

const definitions: readonly SkillDefinition[] = [
  // Programming
  [
    "python",
    "Python",
    "programming",
    "General-purpose language used across data, AI and backend work.",
    ["py"],
  ],
  [
    "javascript",
    "JavaScript",
    "programming",
    "The language of the browser and a large share of backend services.",
    ["js"],
  ],
  [
    "typescript",
    "TypeScript",
    "programming",
    "Typed superset of JavaScript used for maintainable application code.",
    ["ts"],
  ],
  [
    "sql",
    "SQL",
    "programming",
    "Query language for reading, shaping and joining relational data.",
    ["structured query language"],
  ],
  [
    "java",
    "Java",
    "programming",
    "Statically typed language common in enterprise backend systems.",
  ],
  [
    "bash-scripting",
    "Bash Scripting",
    "programming",
    "Automating shell workflows with scripts, pipes and environment setup.",
    ["shell", "shell scripting"],
  ],
  [
    "git",
    "Git",
    "programming",
    "Version control for tracking changes and collaborating on code.",
    ["version control", "github"],
  ],
  [
    "data-structures-algorithms",
    "Data Structures & Algorithms",
    "programming",
    "Core structures, complexity analysis and problem-solving patterns.",
    ["dsa", "algorithms"],
  ],
  [
    "api-design",
    "API Design",
    "programming",
    "Designing predictable, versioned interfaces that other teams can use.",
    ["rest design"],
  ],
  [
    "testing",
    "Testing",
    "programming",
    "Unit, integration and end-to-end tests that keep software reliable.",
    ["unit testing", "jest", "pytest"],
  ],

  // Data
  [
    "numpy",
    "NumPy",
    "data",
    "Array maths and numerical computing foundations for Python.",
  ],
  [
    "pandas",
    "Pandas",
    "data",
    "Tabular data manipulation: filtering, grouping, joining and reshaping.",
    ["dataframes"],
  ],
  [
    "data-cleaning",
    "Data Cleaning",
    "data",
    "Handling missing values, outliers, duplicates and inconsistent formats.",
    ["data wrangling", "data preprocessing"],
  ],
  [
    "data-visualization",
    "Data Visualization",
    "data",
    "Choosing and building charts that communicate a finding clearly.",
    ["charts", "matplotlib", "seaborn"],
  ],
  [
    "statistics",
    "Statistics",
    "data",
    "Descriptive stats, distributions, sampling and hypothesis testing.",
    ["statistical analysis"],
  ],
  [
    "excel",
    "Excel",
    "data",
    "Spreadsheet modelling, pivot tables and quick exploratory analysis.",
    ["spreadsheets"],
  ],
  [
    "tableau",
    "Tableau",
    "data",
    "Interactive BI dashboards for business stakeholders.",
  ],
  [
    "power-bi",
    "Power BI",
    "data",
    "Microsoft BI stack for reports, models and dashboards.",
    ["powerbi"],
  ],
  [
    "etl-pipelines",
    "ETL Pipelines",
    "data",
    "Extracting, transforming and loading data reliably on a schedule.",
    ["data pipelines", "elt"],
  ],
  [
    "data-modeling",
    "Data Modeling",
    "data",
    "Designing schemas, normalisation and dimensional models for analytics.",
    ["database design"],
  ],
  [
    "a-b-testing",
    "A/B Testing",
    "data",
    "Designing experiments and interpreting lift with statistical rigour.",
    ["experimentation", "ab testing"],
  ],

  // AI & Machine Learning
  [
    "machine-learning",
    "Machine Learning",
    "machine-learning",
    "Supervised and unsupervised learning fundamentals and workflows.",
    ["ml"],
  ],
  [
    "scikit-learn",
    "scikit-learn",
    "machine-learning",
    "The standard Python library for classical machine learning models.",
    ["sklearn"],
  ],
  [
    "deep-learning",
    "Deep Learning",
    "machine-learning",
    "Neural networks, backpropagation and training dynamics.",
    ["neural networks"],
  ],
  [
    "pytorch",
    "PyTorch",
    "machine-learning",
    "Deep learning framework favoured for research and custom models.",
    ["torch"],
  ],
  [
    "tensorflow",
    "TensorFlow",
    "machine-learning",
    "Production-oriented deep learning framework and serving ecosystem.",
    ["keras"],
  ],
  [
    "nlp",
    "Natural Language Processing",
    "machine-learning",
    "Working with text: tokenisation, embeddings and language models.",
    ["nlp", "text processing"],
  ],
  [
    "computer-vision",
    "Computer Vision",
    "machine-learning",
    "Image classification, detection and visual model pipelines.",
    ["cv", "image models"],
  ],
  [
    "generative-ai",
    "Generative AI",
    "machine-learning",
    "Building with foundation models for text, image and code generation.",
    ["genai", "gen ai"],
  ],
  [
    "llm-prompting",
    "LLM Prompting",
    "machine-learning",
    "Designing prompts, system instructions and structured model outputs.",
    ["prompt engineering", "prompting"],
  ],
  [
    "rag-systems",
    "RAG Systems",
    "machine-learning",
    "Grounding models with retrieval, embeddings and vector search.",
    ["retrieval augmented generation", "rag", "vector search"],
  ],
  [
    "agentic-ai",
    "Agentic AI",
    "machine-learning",
    "Tool-using agents, planning loops and multi-step automation.",
    ["ai agents", "agents"],
  ],
  [
    "mlops",
    "MLOps",
    "machine-learning",
    "Shipping, versioning and monitoring machine learning models.",
    ["model deployment"],
  ],
  [
    "model-evaluation",
    "Model Evaluation",
    "machine-learning",
    "Metrics, validation splits and error analysis for honest performance.",
    ["model metrics"],
  ],
  [
    "feature-engineering",
    "Feature Engineering",
    "machine-learning",
    "Turning raw data into informative, leakage-free model inputs.",
    ["features"],
  ],
  [
    "reinforcement-learning",
    "Reinforcement Learning",
    "machine-learning",
    "Training agents through reward signals and environment interaction.",
    ["rl"],
  ],

  // DevOps & Cloud
  [
    "linux",
    "Linux",
    "devops-cloud",
    "Command line, permissions, processes and the Unix mental model.",
    ["unix"],
  ],
  [
    "docker",
    "Docker",
    "devops-cloud",
    "Packaging applications into reproducible container images.",
    ["containers", "containerization"],
  ],
  [
    "kubernetes",
    "Kubernetes",
    "devops-cloud",
    "Orchestrating containers: deployments, services and scaling.",
    ["k8s"],
  ],
  [
    "aws",
    "AWS",
    "devops-cloud",
    "Core Amazon cloud services: compute, storage, networking and IAM.",
    ["amazon web services"],
  ],
  [
    "gcp",
    "Google Cloud",
    "devops-cloud",
    "Google Cloud Platform compute, storage and data services.",
    ["google cloud platform"],
  ],
  [
    "azure",
    "Azure",
    "devops-cloud",
    "Microsoft cloud platform services and identity model.",
    ["microsoft azure"],
  ],
  [
    "terraform",
    "Terraform",
    "devops-cloud",
    "Declarative infrastructure as code across cloud providers.",
    ["iac", "infrastructure as code"],
  ],
  [
    "ci-cd",
    "CI/CD",
    "devops-cloud",
    "Automated build, test and deployment pipelines.",
    ["continuous integration", "github actions"],
  ],
  [
    "monitoring-observability",
    "Monitoring & Observability",
    "devops-cloud",
    "Logs, metrics and traces that explain production behaviour.",
    ["observability", "prometheus", "grafana"],
  ],
  [
    "cloud-security",
    "Cloud Security",
    "devops-cloud",
    "IAM, secrets and least-privilege practices in cloud environments.",
    ["iam"],
  ],
  [
    "networking",
    "Networking",
    "devops-cloud",
    "TCP/IP, DNS, HTTP, subnets and how services actually connect.",
    ["tcp/ip", "dns"],
  ],

  // Security
  [
    "network-security",
    "Network Security",
    "security",
    "Firewalls, segmentation, TLS and defending network perimeters.",
    ["firewalls"],
  ],
  [
    "threat-analysis",
    "Threat Analysis",
    "security",
    "Identifying attack paths, threat actors and indicators of compromise.",
    ["threat modeling", "threat hunting"],
  ],
  [
    "siem",
    "SIEM",
    "security",
    "Correlating logs and alerts in a security information platform.",
    ["splunk", "sentinel"],
  ],
  [
    "incident-response",
    "Incident Response",
    "security",
    "Detecting, containing, eradicating and learning from security incidents.",
    ["incident handling", "dfir"],
  ],
  [
    "cryptography",
    "Cryptography",
    "security",
    "Hashing, symmetric and asymmetric encryption and key management.",
    ["encryption", "tls"],
  ],
  [
    "penetration-testing",
    "Penetration Testing",
    "security",
    "Ethically probing systems for exploitable weaknesses.",
    ["pentesting", "ethical hacking"],
  ],
  [
    "security-compliance",
    "Security Compliance",
    "security",
    "Frameworks such as ISO 27001, SOC 2 and NIST controls.",
    ["grc", "iso 27001", "soc 2"],
  ],
  [
    "vulnerability-management",
    "Vulnerability Management",
    "security",
    "Scanning, prioritising and remediating known vulnerabilities.",
    ["cve", "patching"],
  ],

  // Web
  [
    "html-css",
    "HTML & CSS",
    "web",
    "Semantic markup, layout, typography and responsive styling.",
    ["css", "html"],
  ],
  [
    "react",
    "React",
    "web",
    "Component-based UI library with hooks and modern rendering patterns.",
    ["react.js", "reactjs"],
  ],
  [
    "nextjs",
    "Next.js",
    "web",
    "React framework for routing, rendering and full-stack web apps.",
    ["next"],
  ],
  [
    "nodejs",
    "Node.js",
    "web",
    "JavaScript runtime for servers, APIs and tooling.",
    ["node"],
  ],
  [
    "rest-apis",
    "REST APIs",
    "web",
    "HTTP endpoints, status codes, validation and pagination.",
    ["rest", "http api"],
  ],
  [
    "databases",
    "Databases",
    "web",
    "Relational and document databases: queries, indexes and transactions.",
    ["postgres", "postgresql", "mongodb"],
  ],
  [
    "orm",
    "ORMs",
    "web",
    "Typed data access layers such as Prisma or Drizzle.",
    ["prisma", "drizzle"],
  ],
  [
    "authentication",
    "Authentication",
    "web",
    "Sessions, tokens, OAuth and safe handling of user identity.",
    ["auth", "oauth"],
  ],
  [
    "accessibility",
    "Accessibility",
    "web",
    "Building interfaces usable with keyboards and assistive technology.",
    ["a11y"],
  ],
  [
    "responsive-design",
    "Responsive Design",
    "web",
    "Layouts that hold up from phone width to widescreen.",
    ["mobile design"],
  ],
  [
    "state-management",
    "State Management",
    "web",
    "Managing client state, caches and server data boundaries.",
    ["zustand", "redux"],
  ],
  [
    "web-performance",
    "Web Performance",
    "web",
    "Measuring and improving load, render and interaction speed.",
    ["core web vitals", "lighthouse"],
  ],

  // Product
  [
    "product-strategy",
    "Product Strategy",
    "product",
    "Choosing the problem, audience and wedge worth building for.",
    ["strategy"],
  ],
  [
    "user-research",
    "User Research",
    "product",
    "Interviews, usability tests and synthesis that inform decisions.",
    ["ux research", "customer discovery"],
  ],
  [
    "roadmapping",
    "Roadmapping",
    "product",
    "Sequencing outcomes and bets across time with clear trade-offs.",
    ["product roadmap"],
  ],
  [
    "prioritization",
    "Prioritization",
    "product",
    "Frameworks like RICE and opportunity scoring for choosing work.",
    ["rice", "backlog grooming"],
  ],
  [
    "stakeholder-management",
    "Stakeholder Management",
    "product",
    "Aligning engineering, design, sales and leadership around decisions.",
    ["stakeholders"],
  ],
  [
    "wireframing",
    "Wireframing",
    "product",
    "Low-fidelity flows and prototypes that make ideas concrete.",
    ["prototyping", "figma"],
  ],
  [
    "agile-scrum",
    "Agile & Scrum",
    "product",
    "Iterative delivery, sprint planning and backlog refinement.",
    ["agile", "scrum", "kanban"],
  ],
  [
    "product-metrics",
    "Product Metrics",
    "product",
    "Activation, retention and north-star metrics that guide the team.",
    ["north star", "kpis"],
  ],

  // Professional
  [
    "communication",
    "Communication",
    "professional",
    "Explaining work clearly in writing and in conversation.",
    ["writing", "speaking"],
  ],
  [
    "problem-solving",
    "Problem Solving",
    "professional",
    "Breaking ambiguous problems into testable steps.",
    ["debugging", "critical thinking"],
  ],
  [
    "technical-writing",
    "Technical Writing",
    "professional",
    "Documentation, READMEs and explanations another person can follow.",
    ["documentation"],
  ],
  [
    "teamwork",
    "Teamwork",
    "professional",
    "Collaborating, reviewing code and giving useful feedback.",
    ["collaboration"],
  ],
  [
    "presentation",
    "Presentation",
    "professional",
    "Presenting findings and recommendations with confidence.",
    ["public speaking"],
  ],
  [
    "interview-prep",
    "Interview Preparation",
    "professional",
    "Behavioural stories, technical rounds and take-home strategy.",
    ["interviews"],
  ],
  [
    "portfolio-building",
    "Portfolio Building",
    "professional",
    "Packaging projects so a recruiter can see the impact quickly.",
    ["portfolio"],
  ],
  [
    "system-design",
    "System Design",
    "professional",
    "Designing scalable services, data flows and trade-off decisions.",
    ["architecture"],
  ],
];

export const SKILLS: Skill[] = definitions.map(
  ([id, name, category, description, aliases]) => ({
    id,
    name,
    category,
    description,
    aliases: [...(aliases ?? [])],
  })
);

export const SKILLS_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((skill) => [skill.id, skill])
);

export const SKILLS_BY_CATEGORY = SKILLS.reduce<
  Record<SkillCategory, Skill[]>
>(
  (groups, skill) => {
    groups[skill.category].push(skill);
    return groups;
  },
  {
    programming: [],
    data: [],
    "machine-learning": [],
    "devops-cloud": [],
    security: [],
    web: [],
    product: [],
    professional: [],
  }
);

export const SKILL_IDS = SKILLS.map((skill) => skill.id);

export function isSkillId(id: string): boolean {
  return Object.hasOwn(SKILLS_BY_ID, id);
}

export function getSkill(id: string): Skill | undefined {
  return SKILLS_BY_ID[id];
}
