import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getSavedJobs } from "@/services/savedService";
import { getAlerts } from "@/services/alertService";
import { getSearchHistory } from "@/lib/searchHistory";
import type { SavedJob } from "@/types/job";
import {
  Search, Bookmark, CheckCircle, Bell, TrendingUp, MapPin, Database,
} from "lucide-react";

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const map: Record<string, number> = {};
  items.forEach((item) => {
    const key = keyFn(item);
    map[key] = (map[key] || 0) + 1;
  });
  return map;
}

function topN(record: Record<string, number>, n: number) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

const CHART_COLORS = [
  "hsl(173, 58%, 39%)",
  "hsl(210, 80%, 52%)",
  "hsl(38, 92%, 50%)",
  "hsl(152, 60%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(280, 60%, 50%)",
];

export default function StatsPage() {
  const [saved, setSaved] = useState<SavedJob[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [searchCount, setSearchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSavedJobs(),
      getAlerts(),
    ]).then(([s, a]) => {
      setSaved(s);
      setAlertCount(a.length);
      setSearchCount(getSearchHistory().length);
    }).finally(() => setLoading(false));
  }, []);

  const appliedCount = saved.filter((j) => j.status === "applied" || j.status === "interview").length;

  // Aggregate skills
  const allSkills: string[] = saved.flatMap((s) => s.jobSnapshot.skills || []);
  const topSkills = topN(countBy(allSkills, (s) => s), 8);

  // Aggregate locations
  const topLocations = topN(countBy(saved, (s) => s.jobSnapshot.locationText), 6);

  // Aggregate sources
  const topSources = topN(countBy(saved, (s) => s.jobSnapshot.source), 5);

  const statCards = [
    { label: "Sökningar", value: searchCount, icon: Search, color: "text-info" },
    { label: "Sparade jobb", value: saved.length, icon: Bookmark, color: "text-primary" },
    { label: "Ansökta", value: appliedCount, icon: CheckCircle, color: "text-success" },
    { label: "Bevakningar", value: alertCount, icon: Bell, color: "text-warning" },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="inline-block h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pt-2">
        <h1 className="text-3xl font-bold text-foreground">Statistik</h1>
        <p className="text-muted-foreground mt-1">Översikt av din jobbsökning</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="border border-border/60 rounded-xl p-4 bg-card animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`h-4 w-4 ${card.color}`} />
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Skills */}
        {topSkills.length > 0 && (
          <div className="border border-border/60 rounded-xl p-5 bg-card animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              Topp Skills
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topSkills} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topSkills.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Locations */}
        {topLocations.length > 0 && (
          <div className="border border-border/60 rounded-xl p-5 bg-card animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-4">
              <MapPin className="h-4 w-4 text-primary" />
              Vanligaste orter
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topLocations} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {topLocations.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Sources */}
        {topSources.length > 0 && (
          <div className="border border-border/60 rounded-xl p-5 bg-card animate-fade-in md:col-span-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-4">
              <Database className="h-4 w-4 text-primary" />
              Vanligaste källor
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={topSources} margin={{ left: 10, right: 10 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {topSources.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {saved.length === 0 && (
        <div className="py-12 text-center">
          <Bookmark className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            Spara jobb från sökningen för att se statistik här
          </p>
        </div>
      )}
    </div>
  );
}