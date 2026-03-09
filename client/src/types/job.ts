export type JobSource =
  | "jobtech"
  | "jobtech_links"
  | "greenhouse"
  | "lever"
  | "company_feed";

export type RemoteType = "onsite" | "hybrid" | "remote" | "unknown";
export type Seniority = "junior" | "mid" | "senior" | "unknown";
export type SavedStatus = "saved" | "applied" | "interview" | "rejected";
export type AlertSchedule = "daily" | "hourly";
export type SourceStatus = "ok" | "blocked" | "no_feed" | "unknown";
export type AtsHint = "greenhouse" | "lever" | "teamtailor" | "unknown";
export type JobLanguage = "sv" | "en" | "unknown";

export type SortOption =
  | "newest"
  | "best_match"
  | "company_asc"
  | "junior_first"
  | "remote_first";

export interface Job {
  id: string;
  source: JobSource;
  sourceId: string;
  title: string;
  company: string;
  locationText: string;
  remoteType: RemoteType;
  publishedAt: string | null;
  applyUrl: string;
  jobUrl: string;
  descriptionText?: string | null;
  seniority?: Seniority;
  skills?: string[];
  language?: JobLanguage;
}

export interface SearchPreset {
  id: string;
  name: string;
  query: SearchParams;
  createdAt: string;
}

export interface SavedJob {
  _id: string;
  userId: string;
  jobId: string;
  jobSnapshot: Job;
  status: SavedStatus;
  notes: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  _id: string;
  userId: string;
  name: string;
  query: {
    q: string;
    location: string;
    remote: boolean;
    sources: string[];
  };
  schedule: AlertSchedule;
  enabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
}

export interface SourceCompany {
  _id: string;
  name: string;
  domain: string;
  atsHint: AtsHint;
  greenhouseSlug?: string;
  leverAccount?: string;
  careersUrl?: string;
  rssUrl?: string;
  enabled: boolean;
  status: SourceStatus;
}

export interface SearchMeta {
  page: number;
  pageSize: number;
  totalApprox: number;
  sourcesUsed: string[];
  cacheHit: boolean;
}

export interface SearchResponse {
  meta: SearchMeta;
  jobs: Job[];
}

export interface SearchParams {
  q?: string;
  location?: string;
  remote?: boolean;
  withinDays?: number;
  sources?: string[];
  page?: number;
  pageSize?: number;
}