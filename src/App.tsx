import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VideoStateProvider } from "./hooks/useVideoState";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import Weather from "./pages/Weather";
import Events from "./pages/Events";
import Camera from "./pages/Camera";
import Emergency from "./pages/Emergency";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VideoStateProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/events" element={<Events />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/emergency" element={<Emergency />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </VideoStateProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
