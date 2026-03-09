import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { Layout } from "@/components/Layout";
import SearchPage from "@/pages/SearchPage";
import SavedPage from "@/pages/SavedPage";
import AlertsPage from "@/pages/AlertsPage";
import SourcesPage from "@/pages/SourcesPage";
import StatsPage from "@/pages/StatsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<SearchPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;