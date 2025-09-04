import { Search, MapPin, Navigation, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function MapSection() {
  return (
    <div className="flex-1 relative bg-gradient-card border border-border/50 rounded-lg overflow-hidden">
      {/* Map Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for a location"
            className="pl-10 bg-background/80 backdrop-blur-sm border-border/50"
          />
        </div>
      </div>

      {/* Mock Map Content */}
      <div className="h-full bg-gradient-to-br from-primary/5 to-success/5 relative">
        {/* Traffic Markers */}
        <div className="absolute top-24 left-8">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse"></div>
            <span className="text-sm text-foreground">Golden Gate Bridge</span>
          </div>
        </div>

        <div className="absolute top-48 right-16">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-warning/50">
            <div className="h-3 w-3 rounded-full bg-warning animate-pulse"></div>
            <span className="text-sm text-foreground">Alcatraz Island</span>
          </div>
        </div>

        <div className="absolute bottom-32 left-24">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-destructive/50">
            <div className="h-3 w-3 rounded-full bg-destructive animate-pulse"></div>
            <span className="text-sm text-foreground">Bay Bridge</span>
          </div>
        </div>

        {/* Emergency Route Indicator */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="flex items-center gap-2 bg-success/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-success/30">
            <Zap className="h-5 w-5 text-success" />
            <div>
              <div className="text-sm font-medium text-success">Green Wave Active</div>
              <div className="text-xs text-success/80">Emergency route optimized</div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
          <Button size="sm" variant="secondary" className="h-10 w-10">
            <Navigation className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-10 w-10">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {/* City Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-4xl font-bold text-foreground/10">San Francisco</div>
        </div>

        {/* Bottom Trend Placeholders */}
        <div className="absolute left-0 right-0 bottom-0 z-10">
          <div className="bg-background/80 backdrop-blur-md border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div className="rounded-lg border border-border/50 bg-card/80 p-4">
                <div className="text-sm font-medium text-muted-foreground">Traffic Flow Trend</div>
                <div className="mt-2 h-16 w-full rounded-md bg-muted/50"></div>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/80 p-4">
                <div className="text-sm font-medium text-muted-foreground">Incident Trend</div>
                <div className="mt-2 h-16 w-full rounded-md bg-muted/50"></div>
              </div>
              <div className="rounded-lg border border-border/50 bg-card/80 p-4">
                <div className="text-sm font-medium text-muted-foreground">Congestion Trend</div>
                <div className="mt-2 h-16 w-full rounded-md bg-muted/50"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}