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
import { ExternalLink } from "lucide-react";

interface JobCompareModalProps {
  jobs: Job[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const compareFields: { key: string; label: string; render: (job: Job) => React.ReactNode }[] = [
  { key: "title", label: "Titel", render: (j) => j.title },
  { key: "company", label: "Företag", render: (j) => j.company },
  { key: "location", label: "Ort", render: (j) => j.locationText },
  {
    key: "remote",
    label: "Remote",
    render: (j) => {
      const labels: Record<string, string> = { remote: "Remote", hybrid: "Hybrid", onsite: "På plats", unknown: "-" };
      return labels[j.remoteType] || "-";
    },
  },
  {
    key: "seniority",
    label: "Erfarenhet",
    render: (j) => (j.seniority && j.seniority !== "unknown" ? j.seniority : "-"),
  },
  {
    key: "skills",
    label: "Skills",
    render: (j) =>
      j.skills && j.skills.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {j.skills.slice(0, 6).map((s) => (
            <Badge key={s} variant="secondary" className="text-[10px] py-0">
              {s}
            </Badge>
          ))}
        </div>
      ) : (
        "-"
      ),
  },
  {
    key: "published",
    label: "Publicerat",
    render: (j) => {
      if (!j.publishedAt) return "-";
      const d = Math.floor((Date.now() - new Date(j.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
      return d === 0 ? "Idag" : d === 1 ? "Igår" : `${d}d sedan`;
    },
  },
  {
    key: "source",
    label: "Källa",
    render: (j) => j.source,
  },
];

export function JobCompareModal({ jobs, open, onOpenChange }: JobCompareModalProps) {
  if (jobs.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Jämför jobb ({jobs.length})</DialogTitle>
          <DialogDescription>Sida vid sida-jämförelse av valda jobb</DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">
                  Fält
                </th>
                {jobs.map((job) => (
                  <th key={job.id} className="text-left py-2 px-3 font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                        {job.company.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[140px]">{job.company}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field) => (
                <tr key={field.key} className="border-b border-border/40">
                  <td className="py-2.5 pr-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {field.label}
                  </td>
                  {jobs.map((job) => (
                    <td key={job.id} className="py-2.5 px-3 text-foreground">
                      {field.render(job)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Apply links row */}
              <tr>
                <td className="py-3 pr-3 text-xs font-medium text-muted-foreground">Ansök</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3 px-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs rounded-lg"
                      onClick={() => window.open(job.applyUrl, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Öppna
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}