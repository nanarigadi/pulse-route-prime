import { useState, useEffect } from "react";
import { AlertTriangle, X, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CongestionAlert {
  id: string;
  area: string;
  severity: 'high' | 'medium' | 'low';
  expectedDelay: string;
  timeframe: string;
  probability: number;
  coordinates: [number, number];
}

const mockAlerts: CongestionAlert[] = [
  {
    id: '1',
    area: 'Highway A1 - Downtown Exit',
    severity: 'high',
    expectedDelay: '25-40 minutes',
    timeframe: 'Next 2 hours',
    probability: 85,
    coordinates: [-74.006, 40.7128]
  },
  {
    id: '2',
    area: 'Central Business District',
    severity: 'medium',
    expectedDelay: '15-20 minutes',
    timeframe: 'Next 3 hours',
    probability: 65,
    coordinates: [-74.0, 40.72]
  },
  {
    id: '3',
    area: 'Bridge Crossing - East River',
    severity: 'high',
    expectedDelay: '30-45 minutes',
    timeframe: 'Next 1 hour',
    probability: 90,
    coordinates: [-73.98, 40.71]
  }
];

export function CongestionAlerts() {
  const [alerts, setAlerts] = useState<CongestionAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate real-time alerts
    const timer = setTimeout(() => {
      setAlerts(mockAlerts);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set(prev).add(alertId));
  };

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 w-80 max-h-96 overflow-y-auto space-y-2 z-40">
      {visibleAlerts.map((alert, index) => (
        <div
          key={alert.id}
          className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-lg animate-in slide-in-from-right duration-300"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <h4 className="font-medium text-sm">Congestion Alert</h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{alert.area}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{alert.timeframe}</span>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={getSeverityColor(alert.severity)}>
                {alert.severity.toUpperCase()} RISK
              </Badge>
              <span className="text-xs text-muted-foreground">
                {alert.probability}% probability
              </span>
            </div>

            <div className="bg-muted/50 rounded p-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Expected additional delay: <span className="font-medium text-foreground">{alert.expectedDelay}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Due to predicted heavy rainfall in the area
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}