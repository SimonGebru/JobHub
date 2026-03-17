import { fetch } from "undici";
import NodeCache from "node-cache";
import { env } from "../config/env.js";

console.log("Greenhouse boards:", env.greenhouseBoards);
console.log("Lever companies:", env.leverCompanies);

type SearchParams = {
  q?: string;
  location?: string;
  remote?: string;
  sources?: string;
  page?: string;
  pageSize?: string;
};

type JobSource = "jobtech" | "greenhouse" | "lever";

type JobItem = {
  id: string;
  source: JobSource;
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

type SearchResult = {
  meta: {
    page: number;
    pageSize: number;
    totalApprox: number;
    sourcesUsed: string[];
    cacheHit: boolean;
  };
  jobs: JobItem[];
};

const jobsCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});

async function fetchWithTimeout(url: string, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function includesText(value: string | undefined | null, search: string) {
  if (!value) return false;
  return value.toLowerCase().includes(search.toLowerCase());
}

function filterJobsByQuery(jobs: JobItem[], q?: string) {
  if (!q) return jobs;

  return jobs.filter((job) => {
    return (
      includesText(job.title, q) ||
      includesText(job.company, q) ||
      includesText(job.descriptionText, q)
    );
  });
}

function filterJobsByLocation(jobs: JobItem[], location?: string) {
  if (!location) return jobs;

  return jobs.filter((job) => includesText(job.locationText, location));
}

function filterJobsByRemote(jobs: JobItem[], remote?: string) {
  if (remote !== "true") return jobs;

  return jobs.filter(
    (job) => job.remoteType === "remote" || job.remoteType === "hybrid"
  );
}

function filterJobsBySources(jobs: JobItem[], sources?: string) {
  if (!sources) return jobs;

  const selectedSources = sources
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (selectedSources.length === 0) return jobs;

  return jobs.filter((job) => selectedSources.includes(job.source));
}

function detectRemoteType(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("remote")) return "remote";
  if (normalized.includes("hybrid")) return "hybrid";
  if (normalized.includes("distans")) return "remote";

  return "unknown";
}

function detectSeniority(text: string) {
  const normalized = text.toLowerCase();

  if (
    normalized.includes("junior") ||
    normalized.includes("entry level") ||
    normalized.includes("nyexaminerad")
  ) {
    return "junior";
  }

  if (
    normalized.includes("senior") ||
    normalized.includes("lead") ||
    normalized.includes("staff")
  ) {
    return "senior";
  }

  if (normalized.includes("mid")) {
    return "mid";
  }

  return "unknown";
}

function normalizeValue(value: string | undefined | null) {
  return (value || "").trim().toLowerCase();
}

function dedupeJobs(jobs: JobItem[]) {
  const seen = new Map<string, JobItem>();

  for (const job of jobs) {
    const key = [
      normalizeValue(job.title),
      normalizeValue(job.company),
      normalizeValue(job.locationText),
    ].join("|");

    if (!seen.has(key)) {
      seen.set(key, job);
    }
  }

  return Array.from(seen.values());
}

async function fetchJobtechJobs(params: {
  q: string;
  page: number;
  pageSize: number;
}): Promise<JobItem[]> {
  const { q, page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  const url = new URL("https://jobsearch.api.jobtechdev.se/search");

  if (q) {
    url.searchParams.set("q", q);
  }

  url.searchParams.set("limit", String(pageSize));
  url.searchParams.set("offset", String(offset));

  const response = await fetchWithTimeout(url.toString(), 8000);

  if (!response.ok) {
    throw new Error("Failed to fetch jobs from JobTech API");
  }

  const data: any = await response.json();

  return (data.hits || []).map((job: any) => {
    const descriptionText = job.description?.text || "";
    const locationText = job.workplace_address?.city || "";
    const combinedText = `${job.headline || ""} ${descriptionText} ${locationText}`;

    return {
      id: `jobtech:${job.id}`,
      source: "jobtech" as const,
      sourceId: String(job.id),
      title: job.headline || "Untitled job",
      company: job.employer?.name || "Unknown company",
      locationText,
      remoteType: detectRemoteType(combinedText),
      publishedAt: job.publication_date || null,
      applyUrl: job.application_details?.url || job.webpage_url || "",
      jobUrl: job.webpage_url || "",
      descriptionText,
      seniority: detectSeniority(combinedText),
      skills: [],
    };
  });
}

async function fetchGreenhouseJobs(params: { q: string }): Promise<JobItem[]> {
  const { q } = params;

  if (env.greenhouseBoards.length === 0) {
    return [];
  }

  const allJobs = await Promise.all(
    env.greenhouseBoards.map(async (boardToken) => {
      try {
        const url = new URL(
          `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`
        );
        url.searchParams.set("content", "true");

        const response = await fetchWithTimeout(url.toString(), 8000);

        if (!response.ok) {
          console.warn(
            `Failed to fetch Greenhouse jobs for board: ${boardToken} (status: ${response.status})`
          );
          return [];
        }

        const data: any = await response.json();

        console.log(
          `Greenhouse ${boardToken}:`,
          Array.isArray(data.jobs) ? data.jobs.length : "not an array"
        );

        return (data.jobs || []).map((job: any) => {
          const descriptionText = job.content || "";
          const locationText = job.location?.name || "";
          const combinedText = `${job.title || ""} ${descriptionText} ${locationText}`;

          return {
            id: `greenhouse:${job.id}`,
            source: "greenhouse" as const,
            sourceId: String(job.id),
            title: job.title || "Untitled job",
            company: boardToken,
            locationText,
            remoteType: detectRemoteType(combinedText),
            publishedAt: job.updated_at || null,
            applyUrl: job.absolute_url || "",
            jobUrl: job.absolute_url || "",
            descriptionText,
            seniority: detectSeniority(combinedText),
            skills: [],
          };
        });
      } catch (error) {
        console.warn(`Greenhouse request crashed for board: ${boardToken}`, error);
        return [];
      }
    })
  );

  const flatJobs = allJobs.flat();

  if (!q) {
    return flatJobs;
  }

  return filterJobsByQuery(flatJobs, q);
}

async function fetchLeverJobs(params: { q: string }): Promise<JobItem[]> {
  const { q } = params;

  if (env.leverCompanies.length === 0) {
    return [];
  }

  const allJobs = await Promise.all(
    env.leverCompanies.map(async (company) => {
      try {
        const url = new URL(`https://api.lever.co/v0/postings/${company}`);
        url.searchParams.set("mode", "json");

        const response = await fetchWithTimeout(url.toString(), 8000);

        if (!response.ok) {
          console.warn(
            `Failed to fetch Lever jobs for company: ${company} (status: ${response.status})`
          );
          return [];
        }

        const data: any = await response.json();

        console.log(
          `Lever ${company}:`,
          Array.isArray(data) ? data.length : "not an array"
        );

        return (data || []).map((job: any) => {
          const descriptionText = job.description || "";
          const locationText = job.categories?.location || "";
          const combinedText = `${job.text || ""} ${descriptionText} ${locationText}`;

          return {
            id: `lever:${job.id}`,
            source: "lever" as const,
            sourceId: String(job.id),
            title: job.text || "Untitled job",
            company,
            locationText,
            remoteType: detectRemoteType(combinedText),
            publishedAt: job.createdAt
              ? new Date(job.createdAt).toISOString()
              : null,
            applyUrl: job.hostedUrl || "",
            jobUrl: job.hostedUrl || "",
            descriptionText,
            seniority: detectSeniority(combinedText),
            skills: [],
          };
        });
      } catch (error) {
        console.warn(`Lever request crashed for company: ${company}`, error);
        return [];
      }
    })
  );

  const flatJobs = allJobs.flat();

  if (!q) {
    return flatJobs;
  }

  return filterJobsByQuery(flatJobs, q);
}

export async function searchJobs(params: SearchParams): Promise<SearchResult> {
  const {
    q = "",
    location = "",
    remote,
    sources,
    page = "1",
    pageSize = "20",
  } = params;

  const currentPage = Math.max(Number(page) || 1, 1);
  const currentPageSize = Math.max(Number(pageSize) || 20, 1);

  const cacheKey = JSON.stringify({
    q,
    location,
    remote,
    sources,
    page: currentPage,
    pageSize: currentPageSize,
    greenhouseBoards: env.greenhouseBoards,
    leverCompanies: env.leverCompanies,
  });

  const cachedResult = jobsCache.get<SearchResult>(cacheKey);

  if (cachedResult) {
    return {
      ...cachedResult,
      meta: {
        ...cachedResult.meta,
        cacheHit: true,
      },
    };
  }

  const selectedSources = sources
    ? sources
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    : ["jobtech", "greenhouse"];

  const sourceJobs: JobItem[] = [];

  if (selectedSources.includes("jobtech")) {
    const jobtechJobs = await fetchJobtechJobs({
      q,
      page: currentPage,
      pageSize: currentPageSize,
    });

    sourceJobs.push(...jobtechJobs);
  }

  if (selectedSources.includes("greenhouse")) {
    const greenhouseJobs = await fetchGreenhouseJobs({ q });
    sourceJobs.push(...greenhouseJobs);
  }

  if (selectedSources.includes("lever")) {
    const leverJobs = await fetchLeverJobs({ q });
    sourceJobs.push(...leverJobs);
  }

  const filteredJobs = filterJobsByRemote(
    filterJobsByLocation(
      filterJobsBySources(filterJobsByQuery(sourceJobs, q), sources),
      location
    ),
    remote
  );

  const dedupedJobs = dedupeJobs(filteredJobs);
  const paginatedJobs = dedupedJobs.slice(0, currentPageSize);

  const result: SearchResult = {
    meta: {
      page: currentPage,
      pageSize: currentPageSize,
      totalApprox: dedupedJobs.length,
      sourcesUsed: selectedSources,
      cacheHit: false,
    },
    jobs: paginatedJobs,
  };

  jobsCache.set(cacheKey, result);

  return result;
}