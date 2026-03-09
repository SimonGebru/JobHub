import { Clock, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SearchHistoryEntry } from "@/lib/searchHistory";
import type { SearchParams } from "@/types/job";

interface SearchHistoryProps {
  entries: SearchHistoryEntry[];
  onApply: (params: SearchParams) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function SearchHistory({ entries, onApply, onRemove, onClearAll }: SearchHistoryProps) {
  if (entries.length === 0) return null;

  return (
    <div className="border border-border/60 rounded-xl p-4 bg-card space-y-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Senaste sökningar
        </span>
        <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs gap-1 rounded-lg text-muted-foreground">
          <Trash2 className="h-3 w-3" />
          Rensa
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {entries.slice(0, 10).map((entry) => (
          <div key={entry.id} className="group inline-flex items-center gap-0.5">
            <button
              onClick={() => onApply(entry.params)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-accent border border-border/40 transition-colors"
            >
              {entry.label}
            </button>
            <button
              onClick={() => onRemove(entry.id)}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-0.5 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}