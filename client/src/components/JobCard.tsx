import type { Job } from "@/types/job";
import { Bookmark, ExternalLink, CheckCircle, MapPin, Clock, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";
import type { MatchResult } from "@/lib/matchScore";

const sourceLabels: Record<string, { label: string; className: string }> = {
  jobtech: { label: "JobTech", className: "bg-info/10 text-info border-info/20" },
  jobtech_links: { label: "JobAd", className: "bg-info/10 text-info border-info/20" },
  greenhouse: { label: "Greenhouse", className: "bg-success/10 text-success border-success/20" },
  lever: { label: "Lever", className: "bg-warning/10 text-warning border-warning/20" },
  company_feed: { label: "Feed", className: "bg-accent text-accent-foreground border-accent" },
};

const remoteLabels: Record<string, { label: string; className: string }> = {
  remote: { label: "Remote", className: "bg-success/10 text-success border-success/20" },
  hybrid: { label: "Hybrid", className: "bg-warning/10 text-warning border-warning/20" },
  onsite: { label: "På plats", className: "bg-secondary text-secondary-foreground" },
  unknown: { label: "", className: "" },
};

interface JobCardProps {
  job: Job;
  onSave?: (job: Job) => void;
  onApply?: (job: Job) => void;
  isSaved?: boolean;
  onClick?: () => void;
  matchResult?: MatchResult;
  isCompareSelected?: boolean;
  onToggleCompare?: (job: Job) => void;
  compareDisabled?: boolean;
}

export function JobCard({
  job, onSave, onApply, isSaved, onClick,
  matchResult, isCompareSelected, onToggleCompare, compareDisabled,
}: JobCardProps) {
  const daysAgo = job.publishedAt
    ? Math.floor(
        (Date.now() - new Date(job.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const sourceInfo = sourceLabels[job.source] || { label: job.source, className: "bg-muted text-muted-foreground" };
  const remoteInfo = remoteLabels[job.remoteType];

  return (
    <div
      className="group border border-border/60 rounded-xl p-5 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 animate-fade-in cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            {/* Compare checkbox */}
            {onToggleCompare && (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={isCompareSelected}
                  onCheckedChange={() => onToggleCompare(job)}
                  disabled={compareDisabled && !isCompareSelected}
                  className="shrink-0"
                />
              </div>
            )}
            <div className="h-9 w-9 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate leading-tight">{job.title}</h3>
                {matchResult && <MatchScoreBadge match={matchResult} />}
              </div>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {job.locationText}
            </span>
            {remoteInfo.label && (
              <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border ${remoteInfo.className}`}>
                {remoteInfo.label}
              </span>
            )}
            <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border ${sourceInfo.className}`}>
              {sourceInfo.label}
            </span>
            {daysAgo !== null && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {daysAgo === 0 ? "Idag" : daysAgo === 1 ? "Igår" : `${daysAgo}d sedan`}
              </span>
            )}
            {job.seniority && job.seniority !== "unknown" && (
              <Badge variant="outline" className="text-[11px] py-0 px-1.5 capitalize font-normal">
                {job.seniority}
              </Badge>
            )}
            {job.language && job.language !== "unknown" && (
              <Badge variant="outline" className="text-[11px] py-0 px-1.5 uppercase font-normal">
                {job.language}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={(e) => { e.stopPropagation(); onSave?.(job); }}
            disabled={isSaved}
            title="Spara"
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={(e) => { e.stopPropagation(); window.open(job.applyUrl, "_blank"); }}
            title="Öppna annons"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={(e) => { e.stopPropagation(); onApply?.(job); }}
            title="Markera ansökt"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}