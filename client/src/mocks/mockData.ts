import type { Job, SavedJob, Alert, SourceCompany } from "@/types/job";

const companies = [
  "Spotify", "Klarna", "King", "Volvo Cars", "Ericsson", "IKEA Digital",
  "H&M Group", "Northvolt", "Einride", "Voi Technology", "Tink", "Trustly",
  "iZettle", "Polestar", "Tobii", "Storytel", "Readly", "Epidemic Sound",
  "Mojang Studios", "Paradox Interactive", "DICE", "Embark Studios",
  "Vattenfall", "SEB", "Handelsbanken", "Swedbank", "Scania", "ABB",
  "Atlas Copco", "Sandvik",
];

const titles = [
  "Frontend Developer", "Backend Engineer", "Full Stack Developer",
  "Senior Software Engineer", "DevOps Engineer", "Data Engineer",
  "Machine Learning Engineer", "Product Manager", "UX Designer",
  "QA Engineer", "iOS Developer", "Android Developer",
  "Cloud Architect", "Security Engineer", "Site Reliability Engineer",
  "Tech Lead", "Engineering Manager", "Platform Engineer",
  "React Developer", "Node.js Developer", "Python Developer",
  "Java Developer", "Go Developer", "Rust Developer",
  "Data Scientist", "Business Analyst", "Scrum Master",
];

const locations = [
  "Stockholm", "Gothenburg", "Malmo", "Uppsala", "Linkoping",
  "Lund", "Norrkoping", "Vasteras", "Orebro", "Helsingborg",
];

const sources: Job["source"][] = [
  "jobtech", "jobtech_links", "greenhouse", "lever", "company_feed",
];

const remoteTypes: Job["remoteType"][] = ["onsite", "hybrid", "remote", "unknown"];
const seniorities: Job["seniority"][] = ["junior", "mid", "senior", "unknown"];
const languages: Job["language"][] = ["sv", "en", "sv", "en", "unknown"];

const skillSets: string[][] = [
  ["React", "TypeScript", "Node.js", "GraphQL", "Docker"],
  ["Python", "AWS", "PostgreSQL", "CI/CD", "Terraform"],
  ["Java", "Kubernetes", "Azure", "MongoDB", "REST"],
  ["Go", "Docker", "Kubernetes", "CI/CD", "PostgreSQL"],
  ["React", "JavaScript", "Node.js", "MongoDB", "AWS"],
  ["TypeScript", "React", "GraphQL", "Docker", "Kubernetes"],
  ["Python", "Machine Learning", "TensorFlow", "PostgreSQL", "AWS"],
  ["Rust", "Go", "Docker", "CI/CD", "PostgreSQL"],
  ["Vue", "TypeScript", "Node.js", "REST", "Azure"],
  ["React", "TypeScript", "AWS", "Docker", "CI/CD"],
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const descriptions = [
  "Vi soker en erfaren utvecklare som brinner for React, TypeScript och moderna webbtechnologier. Du kommer arbeta i ett agilt team med CI/CD, Docker och Kubernetes. Erfarenhet av GraphQL och Node.js ar meriterande.",
  "Vill du vara med och bygga nasta generations plattform? Vi soker en backend-ingenjor med stark erfarenhet av Python, PostgreSQL och AWS. Du bor ha minst 3 ars erfarenhet.",
  "Som DevOps Engineer hos oss ansvarar du for var infrastruktur pa Azure och GCP. Du arbetar med Terraform, Kubernetes och Git-baserade deployment-pipelines.",
  "Vi soker en Data Scientist med erfarenhet av Machine Learning, Python och SQL. Du kommer arbeta nara produktteamet for att bygga modeller som driver affarsvardet.",
  "En spannande roll for en Full Stack Developer med erfarenhet av Vue, TypeScript och REST-APIer. Teamet arbetar med Agile/Scrum.",
  "Som Tech Lead leder du ett team pa 5 utvecklare. Du har stark erfarenhet av systemdesign, React, Node.js och MongoDB.",
];

function generateJobs(count: number): Job[] {
  const jobs: Job[] = [];
  for (let i = 0; i < count; i++) {
    const source = pick(sources);
    const sourceId = `${1000 + i}`;
    const daysAgo = Math.floor(Math.random() * 30);
    const published = new Date();
    published.setDate(published.getDate() - daysAgo);

    jobs.push({
      id: `${source}:${sourceId}`,
      source,
      sourceId,
      title: pick(titles),
      company: pick(companies),
      locationText: pick(locations),
      remoteType: pick(remoteTypes),
      publishedAt: published.toISOString(),
      applyUrl: `https://example.com/apply/${sourceId}`,
      jobUrl: `https://example.com/jobs/${sourceId}`,
      descriptionText: pick(descriptions),
      seniority: pick(seniorities),
      skills: pick(skillSets),
      language: pick(languages),
    });
  }
  return jobs;
}

export const mockJobs: Job[] = generateJobs(80);

export const mockSavedJobs: SavedJob[] = [
  {
    _id: "saved-1",
    userId: "local",
    jobId: mockJobs[0].id,
    jobSnapshot: mockJobs[0],
    status: "saved",
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "saved-2",
    userId: "local",
    jobId: mockJobs[1].id,
    jobSnapshot: mockJobs[1],
    status: "applied",
    notes: "Skickade CV via deras hemsida",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "saved-3",
    userId: "local",
    jobId: mockJobs[2].id,
    jobSnapshot: mockJobs[2],
    status: "interview",
    notes: "Teknisk intervju bokat 15 mars",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockAlerts: Alert[] = [
  {
    _id: "alert-1",
    userId: "local",
    name: "React jobb i Stockholm",
    query: { q: "react", location: "Stockholm", remote: false, sources: ["jobtech"] },
    schedule: "daily",
    enabled: true,
    lastRunAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: "alert-2",
    userId: "local",
    name: "Remote DevOps",
    query: { q: "devops", location: "", remote: true, sources: ["jobtech", "greenhouse"] },
    schedule: "hourly",
    enabled: false,
    lastRunAt: null,
    createdAt: new Date().toISOString(),
  },
];

export const mockSources: SourceCompany[] = [
  {
    _id: "src-1",
    name: "Spotify",
    domain: "spotify.com",
    atsHint: "greenhouse",
    greenhouseSlug: "spotify",
    enabled: true,
    status: "ok",
  },
  {
    _id: "src-2",
    name: "Klarna",
    domain: "klarna.com",
    atsHint: "lever",
    leverAccount: "klarna",
    enabled: true,
    status: "ok",
  },
  {
    _id: "src-3",
    name: "Volvo Cars",
    domain: "volvocars.com",
    atsHint: "teamtailor",
    enabled: false,
    status: "no_feed",
  },
];