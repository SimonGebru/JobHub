import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Bell, BellRing } from "lucide-react";
import { getAlerts, createAlert, updateAlert, deleteAlert } from "@/services/alertService";
import type { Alert, AlertSchedule } from "@/types/job";
import { useToast } from "@/hooks/use-toast";

export default function AlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [schedule, setSchedule] = useState<AlertSchedule>("daily");

  const load = useCallback(async () => {
    setLoading(true);
    try { setAlerts(await getAlerts()); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const alert = await createAlert({
        name,
        query: { q, location, remote: false, sources: [] },
        schedule,
      });
      setAlerts((prev) => [...prev, alert]);
      setShowForm(false);
      setName(""); setQ(""); setLocation("");
      toast({ title: "Bevakning skapad" });
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateAlert(id, { enabled });
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, enabled } : a)));
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
      toast({ title: "Borttaget" });
    } catch {
      toast({ title: "Fel", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bevakningar</h1>
          <p className="text-muted-foreground mt-1">Få notiser om nya jobb</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="rounded-xl gap-1.5">
          <Plus className="h-4 w-4" />
          Ny bevakning
        </Button>
      </div>

      {showForm && (
        <div className="border border-border/60 rounded-xl p-5 bg-card space-y-4 animate-fade-in">
          <Input
            placeholder="Namn på bevakningen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl"
          />
          <div className="flex gap-2">
            <Input placeholder="Sökord" value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 rounded-xl" />
            <Input placeholder="Ort" value={location} onChange={(e) => setLocation(e.target.value)} className="w-32 rounded-xl" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Schema:</Label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as AlertSchedule)}
                className="text-sm font-medium border border-input rounded-lg px-2.5 py-1.5 bg-background text-foreground"
              >
                <option value="daily">Dagligen</option>
                <option value="hourly">Varje timme</option>
              </select>
            </div>
            <Button onClick={handleCreate} className="rounded-xl">Skapa</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">Avbryt</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-16 text-center">
          <BellRing className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
        <p className="text-muted-foreground">Inga bevakningar skapade ännu</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Gå till{" "}
            <a href="/" className="text-primary hover:underline">sök</a>
            {" "}och skapa en bevakning baserat på din sökning
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`border rounded-xl p-5 flex items-center justify-between gap-4 transition-all animate-fade-in ${
                alert.enabled
                  ? "border-border/60 bg-card"
                  : "border-border/30 bg-muted/30 opacity-70"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                  alert.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{alert.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {alert.query.q && <Badge variant="secondary" className="text-[11px] rounded-md">{alert.query.q}</Badge>}
                    {alert.query.location && <Badge variant="secondary" className="text-[11px] rounded-md">{alert.query.location}</Badge>}
                    <Badge variant="outline" className="text-[11px] capitalize rounded-md">{alert.schedule === "daily" ? "Daglig" : "Varje timme"}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={alert.enabled} onCheckedChange={(v) => handleToggle(alert._id, v)} />
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:text-destructive" onClick={() => handleDelete(alert._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}