import type { Job, Seniority } from "@/types/job";

export interface MatchResult {
  score: number; // 0-100
  reasons: string[];
}

/**
 * Calculate a simple match score for a job based on current search context.
 * Returns a score 0-100 and human-readable reasons.
 */
export function calculateMatchScore(
  job: Job,
  query?: string,
  locationFilter?: string,
  remoteFilter?: boolean,
  selectedSkills?: string[],
  selectedSeniorities?: Seniority[],
): MatchResult {
  const reasons: string[] = [];
  let points = 0;
  let maxPoints = 0;

  // Query match (title, company, description) - weight 30
  if (query && query.trim()) {
    maxPoints += 30;
    const q = query.toLowerCase();
    const titleMatch = job.title.toLowerCase().includes(q);
    const companyMatch = job.company.toLowerCase().includes(q);
    const descMatch = job.descriptionText?.toLowerCase().includes(q);
    if (titleMatch) { points += 30; reasons.push(`Titel matchar "${query}"`); }
    else if (companyMatch) { points += 20; reasons.push(`Företag matchar "${query}"`); }
    else if (descMatch) { points += 10; reasons.push(`Beskrivning nämner "${query}"`); }
  }

  // Skills overlap - weight 30
  if (selectedSkills && selectedSkills.length > 0) {
    maxPoints += 30;
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
    const matched = selectedSkills.filter((s) => jobSkills.includes(s.toLowerCase()));
    if (matched.length > 0) {
      const ratio = matched.length / selectedSkills.length;
      points += Math.round(ratio * 30);
      reasons.push(`${matched.length}/${selectedSkills.length} skills matchar`);
    }
  }

  // Seniority match - weight 15
  if (selectedSeniorities && selectedSeniorities.length > 0) {
    maxPoints += 15;
    if (job.seniority && selectedSeniorities.includes(job.seniority)) {
      points += 15;
      reasons.push(`Erfarenhetsnivå matchar (${job.seniority})`);
    }
  }

  // Location match - weight 15
  if (locationFilter && locationFilter.trim()) {
    maxPoints += 15;
    if (job.locationText.toLowerCase().includes(locationFilter.toLowerCase())) {
      points += 15;
      reasons.push(`Ort matchar "${locationFilter}"`);
    }
  }

  // Remote match - weight 10
  if (remoteFilter) {
    maxPoints += 10;
    if (job.remoteType === "remote") {
      points += 10;
      reasons.push("Remote-jobb");
    } else if (job.remoteType === "hybrid") {
      points += 5;
      reasons.push("Hybrid-jobb");
    }
  }

  // If no filters active, give a base score based on recency
  if (maxPoints === 0) {
    if (job.publishedAt) {
      const daysAgo = Math.floor((Date.now() - new Date(job.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo <= 1) { reasons.push("Publicerat idag"); return { score: 90, reasons }; }
      if (daysAgo <= 3) { reasons.push("Nyligen publicerat"); return { score: 75, reasons }; }
      if (daysAgo <= 7) { reasons.push("Publicerat denna vecka"); return { score: 60, reasons }; }
      return { score: 40, reasons: ["Äldre annons"] };
    }
    return { score: 50, reasons: [] };
  }

  const score = Math.round((points / maxPoints) * 100);
  return { score, reasons };
}

/** Color class for a match score */
export function matchScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-muted-foreground";
}

export function matchScoreBg(score: number): string {
  if (score >= 80) return "bg-success/10 border-success/20";
  if (score >= 50) return "bg-warning/10 border-warning/20";
  return "bg-muted border-border";
}