import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface OnboardingBannerProps {
  icon: LucideIcon;
  title: string;
  description: string;
  linkTo: string;
  linkLabel: string;
}

export function OnboardingBanner({ icon: Icon, title, description, linkTo, linkLabel }: OnboardingBannerProps) {
  return (
    <div className="border border-primary/20 rounded-xl p-5 bg-primary/5 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          <Link
            to={linkTo}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 mt-2 transition-colors"
          >
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}