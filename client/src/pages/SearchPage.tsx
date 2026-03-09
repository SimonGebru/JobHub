import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, SlidersHorizontal, Zap, Save, Building2, GitCompareArrows, ArrowUpDown, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/JobCard";
import { JobDetailModal } from "@/components/JobDetailModal";
import { SearchFilters } from "@/components/SearchFilters";
import { SearchPresets } from "@/components/SearchPresets";
import { SearchHistory } from "@/components/SearchHistory";
import { OnboardingBanner } from "@/components/OnboardingBanner";
import { JobCompareModal } from "@/components/JobCompareModal";
import { searchJobs } from "@/services/jobService";
import { saveJob } from "@/services/savedService";
import { getSources } from "@/services/sourceService";
import { getPresets, createPreset, renamePreset, deletePreset } from "@/services/presetsService";
import { getSearchHistory, addSearchEntry, clearSearchHistory, removeSearchEntry } from "@/lib/searchHistory";
import { calculateMatchScore } from "@/lib/matchScore";
import type { Job, SearchParams, SearchResponse, SearchPreset, Seniority, SortOption, JobLanguage } from "@/types/job";
import type { SearchHistoryEntry } from "@/lib/searchHistory";
import type { MatchResult } from "@/lib/matchScore";
import { useToast } from "@/hooks/use-toast";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Nyast" },
  { value: "best_match", label: "Bäst match" },
  { value: "company_asc", label: "Företag A-Ö" },
  { value: "junior_first", label: "Junior först" },
  { value: "remote_first", label: "Remote först" },
];

export default function SearchPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [withinDays, setWithinDays] = useState(0);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedSeniorities, setSelectedSeniorities] = useState<Seniority[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<JobLanguage[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [presets, setPresets] = useState<SearchPreset[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [hasSources, setHasSources] = useState(true);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [compareJobs, setCompareJobs] = useState<Job[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [modalNotes, setModalNotes] = useState("");

  useEffect(() => {
    getPresets().then(setPresets).catch(() => {});
    getSources().then((s) => setHasSources(s.length > 0)).catch(() => {});
    setHistory(getSearchHistory());
  }, []);

  const buildParams = useCallback((p = 1): SearchParams => ({
    q: q || undefined,
    location: location || undefined,
    remote: remote || undefined,
    withinDays: withinDays || undefined,
    sources: selectedSources.length > 0 ? selectedSources : undefined,
    page: p,
    pageSize: 20,
  }), [q, location, remote, withinDays, selectedSources]);

  const doSearch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = buildParams(p);
      const res = await searchJobs(params, selectedSeniorities, selectedSkills);
      // Language filter (client-side for mock)
      if (selectedLanguages.length > 0) {
        res.jobs = res.jobs.filter((j) => j.language && selectedLanguages.includes(j.language));
        res.meta.totalApprox = res.jobs.length;
      }
      setResult(res);
      setPage(p);
      // Add to search history
      if (params.q || params.location || params.remote) {
        setHistory(addSearchEntry(params));
      }
    } catch {
      toast({ title: "Sökfel", description: "Kunde inte hämta jobb", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [buildParams, selectedSeniorities, selectedSkills, selectedLanguages, toast]);

  useEffect(() => { doSearch(1); }, []);

  // Compute match scores
  const matchScores = useMemo(() => {
    if (!result) return new Map<string, MatchResult>();
    const map = new Map<string, MatchResult>();
    result.jobs.forEach((job) => {
      map.set(job.id, calculateMatchScore(job, q, location, remote, selectedSkills, selectedSeniorities));
    });
    return map;
  }, [result, q, location, remote, selectedSkills, selectedSeniorities]);

  // Sort jobs
  const sortedJobs = useMemo(() => {
    if (!result) return [];
    const jobs = [...result.jobs];
    switch (sortBy) {
      case "best_match":
        return jobs.sort((a, b) => (matchScores.get(b.id)?.score || 0) - (matchScores.get(a.id)?.score || 0));
      case "company_asc":
        return jobs.sort((a, b) => a.company.localeCompare(b.company, "sv"));
      case "junior_first": {
        const order: Record<string, number> = { junior: 0, mid: 1, senior: 2, unknown: 3 };
        return jobs.sort((a, b) => (order[a.seniority || "unknown"] || 3) - (order[b.seniority || "unknown"] || 3));
      }
      case "remote_first": {
        const order: Record<string, number> = { remote: 0, hybrid: 1, onsite: 2, unknown: 3 };
        return jobs.sort((a, b) => (order[a.remoteType] || 3) - (order[b.remoteType] || 3));
      }
      case "newest":
      default:
        return jobs.sort((a, b) => {
          const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return db - da;
        });
    }
  }, [result, sortBy, matchScores]);

  const handleSave = async (job: Job) => {
    try {
      await saveJob(job);
      setSavedIds((prev) => new Set(prev).add(job.id));
      toast({ title: "Sparat", description: `${job.title} hos ${job.company}` });
    } catch {
      toast({ title: "Fel", description: "Kunde inte spara", variant: "destructive" });
    }
  };

  const handleApply = async (job: Job) => {
    try {
      await saveJob(job);
      setSavedIds((prev) => new Set(prev).add(job.id));
      toast({ title: "Markerad som ansökt", description: job.title });
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  const toggleSource = (src: string) =>
    setSelectedSources((prev) => prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]);
  const toggleSeniority = (s: Seniority) =>
    setSelectedSeniorities((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleSkill = (skill: string) =>
    setSelectedSkills((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  const toggleLanguage = (lang: JobLanguage) =>
    setSelectedLanguages((prev) => prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]);

  const clearAllFilters = () => {
    setRemote(false);
    setWithinDays(0);
    setSelectedSources([]);
    setSelectedSeniorities([]);
    setSelectedSkills([]);
    setSelectedLanguages([]);
  };

  const applyPreset = (query: SearchParams) => {
    setQ(query.q || "");
    setLocation(query.location || "");
    setRemote(query.remote || false);
    setWithinDays(query.withinDays || 0);
    setSelectedSources(query.sources || []);
    setTimeout(() => doSearch(1), 50);
  };

  const applyHistoryEntry = (params: SearchParams) => {
    applyPreset(params);
    setShowHistory(false);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    try {
      const preset = await createPreset(presetName.trim(), buildParams());
      setPresets((prev) => [...prev, preset]);
      setPresetName("");
      setShowSavePreset(false);
      toast({ title: "Sökning sparad" });
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  const handleDeletePreset = async (id: string) => {
    await deletePreset(id);
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRenamePreset = async (id: string, name: string) => {
    await renamePreset(id, name);
    setPresets((prev) => prev.map((p) => p.id === id ? { ...p, name } : p));
  };

  const applyQuickFilter = (type: "24h" | "7d" | "remote") => {
    if (type === "24h") setWithinDays(1);
    else if (type === "7d") setWithinDays(7);
    else if (type === "remote") setRemote(true);
    setTimeout(() => doSearch(1), 50);
  };

  const toggleCompare = (job: Job) => {
    setCompareJobs((prev) => {
      if (prev.find((j) => j.id === job.id)) return prev.filter((j) => j.id !== job.id);
      if (prev.length >= 3) return prev;
      return [...prev, job];
    });
  };

  const totalPages = result ? Math.ceil(result.meta.totalApprox / result.meta.pageSize) : 0;
  const activeFilterCount =
    (remote ? 1 : 0) + (withinDays ? 1 : 0) + selectedSources.length +
    selectedSeniorities.length + selectedSkills.length + selectedLanguages.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="pt-2 pb-2">
        <h1 className="text-3xl font-bold text-foreground">
          Hitta ditt nästa <span className="text-primary">drömjobb</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Sök bland tusentals jobb från Platsbanken, Greenhouse, Lever och fler
        </p>
      </div>

      {!hasSources && (
        <OnboardingBanner
          icon={Building2}
          title="Lägg till jobbkällor"
          description="Koppla in företag och ATS-feeds för att utöka din sökning."
          linkTo="/sources"
          linkLabel="Lägg till källor"
        />
      )}

      <SearchPresets presets={presets} onApply={applyPreset} onDelete={handleDeletePreset} onRename={handleRenamePreset} />

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök titel, företag, teknik..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(1)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <Input
          placeholder="Ort"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch(1)}
          className="w-28 sm:w-36 h-11 rounded-xl"
        />
        <Button onClick={() => doSearch(1)} disabled={loading} className="h-11 px-5 rounded-xl">
          {loading ? "Söker..." : "Sök"}
        </Button>
      </div>

      {/* Toolbar: filters, quick buttons, sort, compare, save preset, history */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-0.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
        <span className="text-border">|</span>
        <button onClick={() => applyQuickFilter("24h")} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <Zap className="h-3 w-3" /> 24h
        </button>
        <button onClick={() => applyQuickFilter("7d")} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">7d</button>
        <button onClick={() => applyQuickFilter("remote")} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Remote</button>
        <span className="text-border">|</span>

        {/* Sort */}
        <div className="inline-flex items-center gap-1">
          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs font-medium bg-transparent text-muted-foreground hover:text-foreground border-none outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <span className="text-border">|</span>

        {/* History toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <History className="h-3 w-3" /> Historik
        </button>
        <span className="text-border">|</span>

        {/* Save preset */}
        {showSavePreset ? (
          <div className="inline-flex items-center gap-1.5">
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
              placeholder="Namn..."
              autoFocus
              className="h-7 w-32 text-xs rounded-lg px-2"
            />
            <Button size="sm" onClick={handleSavePreset} className="h-7 text-xs rounded-lg px-2">Spara</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSavePreset(false)} className="h-7 text-xs rounded-lg px-2">Avbryt</Button>
          </div>
        ) : (
          <button
            onClick={() => setShowSavePreset(true)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Save className="h-3 w-3" /> Spara sökning
          </button>
        )}

        {/* Compare button */}
        {compareJobs.length > 0 && (
          <>
            <span className="text-border">|</span>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 rounded-lg"
              onClick={() => setShowCompare(true)}
            >
              <GitCompareArrows className="h-3 w-3" />
              Jämför ({compareJobs.length})
            </Button>
          </>
        )}

        {/* Result count */}
        {result && (
          <span className="text-sm text-muted-foreground ml-auto">
            {result.meta.totalApprox} resultat
            {result.meta.cacheHit && <Badge variant="outline" className="ml-2 text-[11px]">Cache</Badge>}
          </span>
        )}
      </div>

      {/* Search history */}
      {showHistory && (
        <SearchHistory
          entries={history}
          onApply={applyHistoryEntry}
          onRemove={(id) => setHistory(removeSearchEntry(id))}
          onClearAll={() => { clearSearchHistory(); setHistory([]); }}
        />
      )}

      {/* Active filters summary */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Aktiva:</span>
          {remote && <Badge variant="secondary" className="text-[11px]">Remote</Badge>}
          {withinDays > 0 && <Badge variant="secondary" className="text-[11px]">{withinDays}d</Badge>}
          {selectedSeniorities.map((s) => <Badge key={s} variant="secondary" className="text-[11px] capitalize">{s}</Badge>)}
          {selectedSkills.map((s) => <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>)}
          {selectedSources.map((s) => <Badge key={s} variant="secondary" className="text-[11px]">{s}</Badge>)}
          {selectedLanguages.map((l) => <Badge key={l} variant="secondary" className="text-[11px] uppercase">{l}</Badge>)}
          <button onClick={clearAllFilters} className="text-muted-foreground hover:text-foreground ml-1 underline">Rensa</button>
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <SearchFilters
          remote={remote} setRemote={setRemote}
          withinDays={withinDays} setWithinDays={setWithinDays}
          selectedSources={selectedSources} toggleSource={toggleSource}
          selectedSeniorities={selectedSeniorities} toggleSeniority={toggleSeniority}
          selectedSkills={selectedSkills} toggleSkill={toggleSkill}
          selectedLanguages={selectedLanguages} toggleLanguage={toggleLanguage}
          onClearAll={clearAllFilters}
          activeFilterCount={activeFilterCount}
        />
      )}

      {/* Results */}
      <div className="space-y-3">
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Söker jobb...</p>
          </div>
        )}
        {!loading && sortedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSave={handleSave}
            onApply={handleApply}
            isSaved={savedIds.has(job.id)}
            onClick={() => { setSelectedJob(job); setModalNotes(""); }}
            matchResult={matchScores.get(job.id)}
            isCompareSelected={!!compareJobs.find((j) => j.id === job.id)}
            onToggleCompare={toggleCompare}
            compareDisabled={compareJobs.length >= 3}
          />
        ))}
        {!loading && result && result.jobs.length === 0 && (
          <div className="py-16 text-center">
            <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Inga jobb hittades. Prova bredare sökord.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-4 pb-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => doSearch(page - 1)} className="rounded-lg">Föregående</Button>
          <span className="text-sm text-muted-foreground tabular-nums">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => doSearch(page + 1)} className="rounded-lg">Nästa</Button>
        </div>
      )}

      {/* Job detail modal */}
      <JobDetailModal
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
        onSave={handleSave}
        onApply={handleApply}
        isSaved={selectedJob ? savedIds.has(selectedJob.id) : false}
        matchResult={selectedJob ? matchScores.get(selectedJob.id) : undefined}
        notes={modalNotes}
        onNotesChange={setModalNotes}
      />

      {/* Compare modal */}
      <JobCompareModal
        jobs={compareJobs}
        open={showCompare}
        onOpenChange={setShowCompare}
      />
    </div>
  );
}