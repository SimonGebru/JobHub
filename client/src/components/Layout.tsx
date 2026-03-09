import { Link, useLocation } from "react-router-dom";
import { Search, Bookmark, Bell, Building2, Moon, Sun, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { DevBanner } from "./DevBanner";

const navItems = [
  { to: "/", label: "Sök jobb", icon: Search },
  { to: "/saved", label: "Sparade", icon: Bookmark },
  { to: "/alerts", label: "Bevakningar", icon: Bell },
  { to: "/sources", label: "Källor", icon: Building2 },
  { to: "/stats", label: "Statistik", icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <DevBanner />
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/90 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
              JH
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
              JobHub<span className="text-primary">.se</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <nav className="flex gap-0.5">
              {navItems.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg ml-1"
              onClick={toggle}
              title={theme === "dark" ? "Ljust läge" : "Mörkt läge"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">{children}</main>
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        JobHub.se — Svensk jobbaggregerare
      </footer>
    </div>
  );
}