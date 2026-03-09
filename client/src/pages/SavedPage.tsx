import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Inbox } from "lucide-react";
import { getSavedJobs, updateSavedJob, deleteSavedJob } from "@/services/savedService";
import { getJobTags, setJobTags } from "@/services/tagsService";
import { TagInput } from "@/components/TagInput";
import type { SavedJob, SavedStatus } from "@/types/job";
import type { JobTags } from "@/services/tagsService";
import { useToast } from "@/hooks/use-toast";

const statusTabs: { value: SavedStatus; label: string; color: string }[] = [
  { value: "saved", label: "Sparade", color: "bg-info/10 text-info" },
  { value: "applied", label: "Ansökta", color: "bg-warning/10 text-warning" },
  { value: "interview", label: "Intervju", color: "bg-success/10 text-success" },
  { value: "rejected", label: "Avslag", color: "bg-destructive/10 text-destructive" },
];

export default function SavedPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<JobTags>({});
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [savedJobs, tags] = await Promise.all([getSavedJobs(), getJobTags()]);
      setJobs(savedJobs);
      setAllTags(tags);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, status: SavedStatus) => {
    try {
      await updateSavedJob(id, { status });
      setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, status } : j)));
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  const handleNotesChange = (id: string, notes: string) => {
    setJobs((prev) => prev.map((j) => (j._id === id ? { ...j, notes } : j)));
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      try {
        await updateSavedJob(id, { notes });
      } catch {
        toast({ title: "Kunde inte spara anteckning", variant: "destructive" });
      }
    }, 4000);
  };

  const handleTagsChange = async (jobId: string, tags: string[]) => {
    setAllTags((prev) => ({ ...prev, [jobId]: tags }));
    try {
      await setJobTags(jobId, tags);
    } catch {
      toast({ title: "Kunde inte spara tags", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedJob(id);
      setJobs((prev) => prev.filter((j) => j._id !== id));
      toast({ title: "Borttaget" });
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  const sortedByDate = (list: SavedJob[]) =>
    [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pt-2">
        <h1 className="text-3xl font-bold text-foreground">Sparade jobb</h1>
        <p className="text-muted-foreground mt-1">Håll koll på dina ansökningar</p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="saved">
          <TabsList className="bg-secondary/60 rounded-xl p-1 h-auto">
            {statusTabs.map((tab) => {
              const count = jobs.filter((j) => j.status === tab.value).length;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="rounded-lg data-[state=active]:shadow-sm px-4 py-2">
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tab.color}`}>{count}</span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {statusTabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-3 mt-5">
              {sortedByDate(jobs.filter((j) => j.status === tab.value)).map((sj) => (
                <div key={sj._id} className="border border-border/60 rounded-xl p-5 bg-card space-y-3 animate-fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                        {sj.jobSnapshot.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate leading-tight">{sj.jobSnapshot.title}</h3>
                        <p className="text-sm text-muted-foreground">{sj.jobSnapshot.company} · {sj.jobSnapshot.locationText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select
                        value={sj.status}
                        onChange={(e) => handleStatusChange(sj._id, e.target.value as SavedStatus)}
                        className="text-xs font-medium border border-input rounded-lg px-2 py-1.5 bg-background text-foreground"
                      >
                        {statusTabs.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => window.open(sj.jobSnapshot.applyUrl, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(sj._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Tags</p>
                    <TagInput
                      tags={allTags[sj.jobId] || []}
                      onChange={(tags) => handleTagsChange(sj.jobId, tags)}
                    />
                  </div>

                  {/* Notes */}
                  <Textarea
                    placeholder="Lägg till anteckningar..."
                    value={sj.notes}
                    onChange={(e) => handleNotesChange(sj._id, e.target.value)}
                    className="min-h-[60px] text-sm rounded-xl resize-none"
                  />
                </div>
              ))}
              {jobs.filter((j) => j.status === tab.value).length === 0 && (
                <div className="py-16 text-center">
                  <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">
                    {tab.value === "saved" ? "Inga sparade jobb ännu" : "Inga jobb i denna kategori"}
                  </p>
                  {tab.value === "saved" && jobs.length === 0 && (
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Gå till <a href="/" className="text-primary hover:underline">sök</a> och spara jobb du är intresserad av
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}