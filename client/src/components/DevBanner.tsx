import { USE_MOCK_API, API_BASE_URL } from "@/config";
import { Terminal } from "lucide-react";

export function DevBanner() {
  return (
    <div className="bg-foreground/[0.03] border-b border-border/40 px-4 py-1.5 text-[11px] font-mono text-muted-foreground flex items-center gap-3">
      <Terminal className="h-3 w-3 opacity-50" />
      <span className="opacity-60">mode:</span>
      <span className={USE_MOCK_API ? "text-success font-semibold" : "text-destructive font-semibold"}>
        {USE_MOCK_API ? "MOCK" : "LIVE"}
      </span>
      <span className="opacity-30">|</span>
      <span className="opacity-60">api:</span>
      <span className="opacity-80">{API_BASE_URL}</span>
    </div>
  );
}