import { matchScoreColor, matchScoreBg } from "@/lib/matchScore";
import type { MatchResult } from "@/lib/matchScore";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MatchScoreBadgeProps {
  match: MatchResult;
  size?: "sm" | "md";
}

export function MatchScoreBadge({ match, size = "sm" }: MatchScoreBadgeProps) {
  const colorClass = matchScoreColor(match.score);
  const bgClass = matchScoreBg(match.score);

  if (size === "md") {
    return (
      <div className={`rounded-xl border p-3 ${bgClass}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-2xl font-bold ${colorClass}`}>{match.score}%</span>
          <span className="text-xs text-muted-foreground font-medium">Match</span>
        </div>
        {match.reasons.length > 0 && (
          <ul className="space-y-0.5">
            {match.reasons.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                • {r}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border cursor-default ${bgClass} ${colorClass}`}
        >
          {match.score}%
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        {match.reasons.length > 0 ? (
          <ul className="text-xs space-y-0.5">
            {match.reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs">Ingen specifik matchning</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}