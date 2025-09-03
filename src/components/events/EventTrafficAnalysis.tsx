import { Activity, BarChart3, Car, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TrafficData {
  area: string;
  currentFlow: number;
  normalFlow: number;
  congestionLevel: 'low' | 'moderate' | 'high' | 'severe';
  averageSpeed: number;
  normalSpeed: number;
  incidentCount: number;
  eventImpact: number;
}

const liveData: TrafficData[] = [
  {
    area: 'Midtown West',
    currentFlow: 2400,
    normalFlow: 3200,
    congestionLevel: 'severe',
    averageSpeed: 12,
    normalSpeed: 35,
    incidentCount: 3,
    eventImpact: 85
  },
  {
    area: 'Times Square',
    currentFlow: 1800,
    normalFlow: 2800,
    congestionLevel: 'high',
    averageSpeed: 18,
    normalSpeed: 28,
    incidentCount: 2,
    eventImpact: 70
  },
  {
    area: 'Bronx Stadium',
    currentFlow: 1200,
    normalFlow: 1600,
    congestionLevel: 'moderate',
    averageSpeed: 25,
    normalSpeed: 40,
    incidentCount: 1,
    eventImpact: 45
  }
];

export function EventTrafficAnalysis() {
  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'severe': return 'text-destructive';
      case 'high': return 'text-red-500';
      case 'moderate': return 'text-amber-500';
      case 'low': return 'text-emerald-500';
      default: return 'text-muted-foreground';
    }
  };

  const getCongestionBadge = (level: string) => {
    switch (level) {
      case 'severe': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-red-500 text-white';
      case 'moderate': return 'bg-amber-500 text-white';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Live Traffic Analysis</h3>
      </div>

      <div className="bg-background/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-3">Real-time Metrics</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">-35%</div>
            <div className="text-muted-foreground">Traffic Flow</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-500">-65%</div>
            <div className="text-muted-foreground">Avg Speed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">6</div>
            <div className="text-muted-foreground">Active Incidents</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-500">8</div>
            <div className="text-muted-foreground">Alt Routes</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {liveData.map((data, index) => (
          <div key={index} className="bg-background/50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{data.area}</h4>
              <Badge className={getCongestionBadge(data.congestionLevel)} variant="secondary">
                {data.congestionLevel.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <Car className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Traffic Flow</span>
                </div>
                <div className="text-sm font-medium">
                  {data.currentFlow.toLocaleString()} vph
                </div>
                <div className="text-xs text-muted-foreground">
                  Normal: {data.normalFlow.toLocaleString()} vph
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <BarChart3 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Avg Speed</span>
                </div>
                <div className="text-sm font-medium">
                  {data.averageSpeed} km/h
                </div>
                <div className="text-xs text-muted-foreground">
                  Normal: {data.normalSpeed} km/h
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Event Impact</span>
                <span className="font-medium">{data.eventImpact}%</span>
              </div>
              <Progress value={data.eventImpact} className="h-1.5" />
            </div>

            {data.incidentCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 rounded p-2">
                <AlertCircle className="h-3 w-3" />
                <span>{data.incidentCount} active incident{data.incidentCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-background/50 rounded-lg p-3">
        <h4 className="font-medium text-sm mb-2">System Recommendations</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Activate Green Wave on 7th Avenue corridor</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Extend signal timing on Broadway by 20%</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Deploy traffic enforcement to Penn Station area</span>
          </div>
        </div>
      </div>
    </div>
  );
}