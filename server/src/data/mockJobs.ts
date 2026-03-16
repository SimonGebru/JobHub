export type JobItem = {
  id: string;
  source: "jobtech" | "jobtech_links" | "greenhouse" | "lever" | "company_feed";
  sourceId: string;
  title: string;
  company: string;
  locationText: string;
  remoteType: "onsite" | "hybrid" | "remote" | "unknown";
  publishedAt: string | null;
  applyUrl: string;
  jobUrl: string;
  descriptionText?: string | null;
  seniority?: "junior" | "mid" | "senior" | "unknown";
  skills?: string[];
};

export const mockJobs: JobItem[] = [
  {
    id: "jobtech:1",
    source: "jobtech",
    sourceId: "1",
    title: "Frontend Developer",
    company: "Nordic Apps AB",
    locationText: "Göteborg",
    remoteType: "hybrid",
    publishedAt: "2026-03-08T10:00:00.000Z",
    applyUrl: "https://example.com/jobs/1/apply",
    jobUrl: "https://example.com/jobs/1",
    descriptionText: "Looking for a frontend developer with React and TypeScript experience.",
    seniority: "junior",
    skills: ["React", "TypeScript", "JavaScript"],
  },
  {
    id: "jobtech:2",
    source: "jobtech",
    sourceId: "2",
    title: "Backend Developer",
    company: "Cloud Core Systems",
    locationText: "Stockholm",
    remoteType: "remote",
    publishedAt: "2026-03-07T09:00:00.000Z",
    applyUrl: "https://example.com/jobs/2/apply",
    jobUrl: "https://example.com/jobs/2",
    descriptionText: "Node.js backend developer with API and database experience.",
    seniority: "mid",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: "jobtech:3",
    source: "jobtech",
    sourceId: "3",
    title: "Fullstack Developer",
    company: "Studio Flow",
    locationText: "Malmö",
    remoteType: "onsite",
    publishedAt: "2026-03-06T14:30:00.000Z",
    applyUrl: "https://example.com/jobs/3/apply",
    jobUrl: "https://example.com/jobs/3",
    descriptionText: "Fullstack role with React, Node and PostgreSQL.",
    seniority: "mid",
    skills: ["React", "Node.js", "PostgreSQL"],
  },
  {
    id: "jobtech:4",
    source: "jobtech",
    sourceId: "4",
    title: "Junior React Developer",
    company: "Pixel Forge",
    locationText: "Göteborg",
    remoteType: "remote",
    publishedAt: "2026-03-05T08:15:00.000Z",
    applyUrl: "https://example.com/jobs/4/apply",
    jobUrl: "https://example.com/jobs/4",
    descriptionText: "Junior React role focused on UI development.",
    seniority: "junior",
    skills: ["React", "CSS", "JavaScript"],
  },
  {
    id: "jobtech:5",
    source: "jobtech",
    sourceId: "5",
    title: "Software Engineer",
    company: "Next Horizon",
    locationText: "Uppsala",
    remoteType: "hybrid",
    publishedAt: "2026-03-04T12:00:00.000Z",
    applyUrl: "https://example.com/jobs/5/apply",
    jobUrl: "https://example.com/jobs/5",
    descriptionText: "General software engineering role with modern web stack.",
    seniority: "senior",
    skills: ["TypeScript", "React", "Node.js"],
  },
];