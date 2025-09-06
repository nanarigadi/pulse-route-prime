import { TrafficMap } from "./TrafficMap";

export function MapSection() {
  return (
    <div className="flex-1 relative bg-gradient-card border border-border/50 rounded-lg overflow-hidden">
      {/* Live Traffic Map */}
      <div className="h-full relative">
        <TrafficMap />
      </div>
    </div>
  );
}