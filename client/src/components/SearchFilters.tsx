import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Seniority, JobLanguage } from "@/types/job";

const withinDaysOptions = [
  { value: 0, label: "Alla" },
  { value: 1, label: "24h" },
  { value: 3, label: "3 dagar" },
  { value: 7, label: "7 dagar" },
  { value: 14, label: "14 dagar" },
  { value: 30, label: "30 dagar" },
];

const sourceOptions = [
  { value: "jobtech", label: "JobTech" },
  { value: "jobtech_links", label: "JobAd Links" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "lever", label: "Lever" },
  { value: "company_feed", label: "Company Feed" },
];

const seniorityOptions: { value: Seniority; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
];

const languageOptions: { value: JobLanguage; label: string }[] = [
  { value: "sv", label: "Svenska" },
  { value: "en", label: "English" },
];

const COMMON_SKILLS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java",
  "Go", "Rust", "AWS", "Azure", "Docker", "Kubernetes",
  "GraphQL", "PostgreSQL", "MongoDB", "CI/CD",
];

interface SearchFiltersProps {
  remote: boolean;
  setRemote: (v: boolean) => void;
  withinDays: number;
  setWithinDays: (v: number) => void;
  selectedSources: string[];
  toggleSource: (src: string) => void;
  selectedSeniorities: Seniority[];
  toggleSeniority: (s: Seniority) => void;
  selectedSkills: string[];
  toggleSkill: (skill: string) => void;
  selectedLanguages: JobLanguage[];
  toggleLanguage: (lang: JobLanguage) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

export function SearchFilters({
  remote, setRemote,
  withinDays, setWithinDays,
  selectedSources, toggleSource,
  selectedSeniorities, toggleSeniority,
  selectedSkills, toggleSkill,
  selectedLanguages, toggleLanguage,
  onClearAll, activeFilterCount,
}: SearchFiltersProps) {
  return (
    <div className="border border-border/60 rounded-xl p-4 bg-card space-y-4 animate-fade-in">
      {/* Clear all */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {activeFilterCount} aktiva filter
          </span>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs gap-1 rounded-lg">
            <X className="h-3 w-3" />
            Rensa alla
          </Button>
        </div>
      )}

      {/* Remote toggle */}
      <div className="flex items-center gap-3">
        <Switch id="remote" checked={remote} onCheckedChange={setRemote} />
        <Label htmlFor="remote" className="text-sm font-medium">Visa remote / hybrid</Label>
      </div>

      {/* Within days */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Publicerat inom</p>
        <div className="flex flex-wrap gap-1.5">
          {withinDaysOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWithinDays(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                withinDays === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seniority */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Erfarenhetsnivå</p>
        <div className="flex flex-wrap gap-1.5">
          {seniorityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleSeniority(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                selectedSeniorities.includes(opt.value)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                selectedSkills.includes(skill)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Språk</p>
        <div className="flex flex-wrap gap-1.5">
          {languageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleLanguage(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                selectedLanguages.includes(opt.value)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Källor</p>
        <div className="flex flex-wrap gap-1.5">
          {sourceOptions.map((src) => (
            <button
              key={src.value}
              onClick={() => toggleSource(src.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                selectedSources.includes(src.value)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {src.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}