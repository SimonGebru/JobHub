import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Globe } from "lucide-react";
import { getSources, createSource } from "@/services/sourceService";
import type { SourceCompany, AtsHint } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; className: string }> = {
  ok: { label: "OK", className: "bg-success/10 text-success border-success/20" },
  blocked: { label: "Blockerad", className: "bg-destructive/10 text-destructive border-destructive/20" },
  no_feed: { label: "Ingen feed", className: "bg-warning/10 text-warning border-warning/20" },
  unknown: { label: "Okänd", className: "bg-muted text-muted-foreground" },
};

export default function SourcesPage() {
  const { toast } = useToast();
  const [sources, setSources] = useState<SourceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [atsHint, setAtsHint] = useState<AtsHint>("unknown");
  const [greenhouseSlug, setGreenhouseSlug] = useState("");
  const [leverAccount, setLeverAccount] = useState("");
  const [careersUrl, setCareersUrl] = useState("");
  const [rssUrl, setRssUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setSources(await getSources()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!name.trim() || !domain.trim()) return;
    try {
      const source = await createSource({
        name, domain, atsHint,
        greenhouseSlug: greenhouseSlug || undefined,
        leverAccount: leverAccount || undefined,
        careersUrl: careersUrl || undefined,
        rssUrl: rssUrl || undefined,
        enabled: true,
      });
      setSources((prev) => [...prev, source]);
      setShowForm(false);
      setName(""); setDomain(""); setAtsHint("unknown");
      setGreenhouseSlug(""); setLeverAccount(""); setCareersUrl(""); setRssUrl("");
      toast({ title: "Källa tillagd" });
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Källor</h1>
          <p className="text-muted-foreground mt-1">Lägg till företag och ATS-feeds</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-1.5">
          <Plus className="h-4 w-4" />
          Lägg till
        </Button>
      </div>

      {showForm && (
        <div className="border border-border/60 rounded-xl p-5 bg-card space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Namn *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spotify" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Domän *</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="spotify.com" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">ATS</Label>
              <select
                value={atsHint}
                onChange={(e) => setAtsHint(e.target.value as AtsHint)}
                className="w-full text-sm font-medium border border-input rounded-xl px-3 py-2.5 bg-background text-foreground"
              >
                <option value="unknown">Okänd</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="lever">Lever</option>
                <option value="teamtailor">Teamtailor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Greenhouse Slug</Label>
              <Input value={greenhouseSlug} onChange={(e) => setGreenhouseSlug(e.target.value)} placeholder="spotify" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Lever Account</Label>
              <Input value={leverAccount} onChange={(e) => setLeverAccount(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Careers URL</Label>
              <Input value={careersUrl} onChange={(e) => setCareersUrl(e.target.value)} className="rounded-xl" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">RSS URL</Label>
              <Input value={rssUrl} onChange={(e) => setRssUrl(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={handleCreate} className="rounded-xl">Lägg till</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">Avbryt</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sources.length === 0 ? (
        <div className="py-16 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-muted-foreground">Inga källor tillagda</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Lägg till företag för att hämta jobb från deras karriärsidor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sources.map((src) => {
            const status = statusConfig[src.status] || statusConfig.unknown;
            return (
              <div
                key={src._id}
                className="border border-border/60 rounded-xl p-5 bg-card flex items-center justify-between gap-4 animate-fade-in"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/8 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{src.name}</h3>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{src.domain}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {src.atsHint !== "unknown" && (
                        <Badge variant="outline" className="text-[11px] capitalize rounded-md">{src.atsHint}</Badge>
                      )}
                      {src.greenhouseSlug && (
                        <Badge variant="secondary" className="text-[11px] rounded-md">GH: {src.greenhouseSlug}</Badge>
                      )}
                      {src.leverAccount && (
                        <Badge variant="secondary" className="text-[11px] rounded-md">Lever: {src.leverAccount}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Switch checked={src.enabled} disabled />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}