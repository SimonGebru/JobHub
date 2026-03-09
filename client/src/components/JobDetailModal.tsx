import { useState } from "react";
import type { Job } from "@/types/job";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";
import { MapPin, Clock, ExternalLink, Bookmark, CheckCircle, Briefcase } from "lucide-react";
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

function getSkills(job: Job): string[] {
  if (job.skills && job.skills.length > 0) return job.skills;
  const text = job.descriptionText;
  if (!text) return [];
  const patterns = [
    "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "Go", "Rust",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "GraphQL", "REST",
    "PostgreSQL", "MongoDB", "Redis", "Terraform", "Git",
  ];
  return patterns.filter((s) => text.toLowerCase().includes(s.toLowerCase()));
}

interface JobDetailModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (job: Job) => void;
  onApply?: (job: Job) => void;
  isSaved?: boolean;
  matchResult?: MatchResult;
  notes?: string;
  onNotesChange?: (notes: string) => void;
}

export function JobDetailModal({
  job, open, onOpenChange, onSave, onApply, isSaved,
  matchResult, notes, onNotesChange,
}: JobDetailModalProps) {
  if (!job) return null;

  const sourceInfo = sourceLabels[job.source] || { label: job.source, className: "bg-muted text-muted-foreground" };
  const remoteInfo = remoteLabels[job.remoteType];
  const skills = getSkills(job);

  const daysAgo = job.publishedAt
    ? Math.floor((Date.now() - new Date(job.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-11 w-11 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl leading-tight">{job.title}</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">{job.company}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Match score */}
        {matchResult && (
          <MatchScoreBadge match={matchResult} size="md" />
        )}

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {job.locationText}
          </span>
          {remoteInfo.label && (
            <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${remoteInfo.className}`}>
              {remoteInfo.label}
            </span>
          )}
          <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full border ${sourceInfo.className}`}>
            {sourceInfo.label}
          </span>
          {daysAgo !== null && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {daysAgo === 0 ? "Idag" : daysAgo === 1 ? "Igår" : `${daysAgo} dagar sedan`}
            </span>
          )}
          {job.seniority && job.seniority !== "unknown" && (
            <Badge variant="outline" className="text-xs capitalize">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.seniority}
            </Badge>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Beskrivning</h4>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {job.descriptionText || "Ingen beskrivning tillgänglig. Klicka på 'Öppna annons' för att läsa mer."}
          </p>
        </div>

        {/* Notes */}
        {onNotesChange !== undefined && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Anteckningar</h4>
            <Textarea
              value={notes || ""}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Skriv anteckningar om detta jobb..."
              className="min-h-[60px] text-sm rounded-xl resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/60">
          <Button onClick={() => window.open(job.applyUrl, "_blank")} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Öppna annons
          </Button>
          <Button variant="outline" onClick={() => onSave?.(job)} disabled={isSaved} className="gap-2">
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
            {isSaved ? "Sparad" : "Spara"}
          </Button>
          <Button variant="outline" onClick={() => onApply?.(job)} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Markera ansökt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}