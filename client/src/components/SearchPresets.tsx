import { useState } from "react";
import { X, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchPreset, SearchParams } from "@/types/job";

interface SearchPresetsProps {
  presets: SearchPreset[];
  onApply: (query: SearchParams) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function SearchPresets({ presets, onApply, onDelete, onRename }: SearchPresetsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (presets.length === 0) return null;

  const startEdit = (preset: SearchPreset) => {
    setEditingId(preset.id);
    setEditName(preset.name);
  };

  const confirmEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mr-1">
        <Star className="h-3 w-3" />
        Sparade sökningar:
      </span>
      {presets.map((preset) => (
        <div key={preset.id} className="group inline-flex items-center gap-0.5">
          {editingId === preset.id ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
              onBlur={confirmEdit}
              autoFocus
              className="h-7 w-28 text-xs rounded-lg px-2"
            />
          ) : (
            <button
              onClick={() => onApply(preset.query)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/15 transition-colors"
            >
              {preset.name}
            </button>
          )}
          <button
            onClick={() => startEdit(preset)}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-0.5 transition-opacity"
            title="Byt namn"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(preset.id)}
            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-0.5 transition-opacity"
            title="Ta bort"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}