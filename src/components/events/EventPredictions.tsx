import { TrendingUp, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EventPrediction {
  id: string;
  event: string;
  location: string;
  timeframe: string;
  trafficIncrease: number;
  impactLevel: 'low' | 'medium' | 'high' | 'severe';
  estimatedDelay: string;
  alternativeRoutes: number;
  attendees: number;
}

const predictions: EventPrediction[] = [
  {
    id: '1',
    event: 'Madison Square Garden Concert',
    location: 'Midtown Manhattan',
    timeframe: 'Next 2 hours',
    trafficIncrease: 85,
    impactLevel: 'severe',
    estimatedDelay: '35-50 minutes',
    alternativeRoutes: 3,
    attendees: 18500
  },
  {
    id: '2',
    event: 'Yankees Game',
    location: 'Bronx Stadium Area',
    timeframe: 'Next 3 hours',
    trafficIncrease: 65,
    impactLevel: 'high',
    estimatedDelay: '20-30 minutes',
    alternativeRoutes: 5,
    attendees: 51000
  },
  {
    id: '3',
    event: 'Street Festival',
    location: 'Lower Manhattan',
    timeframe: 'Ongoing',
    trafficIncrease: 40,
    impactLevel: 'medium',
    estimatedDelay: '10-15 minutes',
    alternativeRoutes: 4,
    attendees: 12000
  }
];

export function EventPredictions() {
  const getImpactColor = (level: string) => {
    switch (level) {
      case 'severe': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = (increase: number) => {
    if (increase >= 80) return 'bg-destructive';
    if (increase >= 60) return 'bg-red-500';
    if (increase >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Traffic Predictions</h3>
      </div>

      <div className="space-y-3">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="bg-background/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{prediction.event}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{prediction.location}</span>
                </div>
              </div>
              <Badge className={getImpactColor(prediction.impactLevel)} variant="secondary">
                {prediction.impactLevel.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Traffic Increase</span>
                <span className="font-medium">{prediction.trafficIncrease}%</span>
              </div>
              <Progress 
                value={prediction.trafficIncrease} 
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Delay:</span>
              </div>
              <span className="font-medium">{prediction.estimatedDelay}</span>
              
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Attendees:</span>
              </div>
              <span className="font-medium">{prediction.attendees.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
              <span className="text-muted-foreground">{prediction.timeframe}</span>
              <span className="text-primary">{prediction.alternativeRoutes} alt routes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}