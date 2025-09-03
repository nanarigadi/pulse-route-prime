import { Sidebar } from "@/components/dashboard/Sidebar";
import { EventMap } from "@/components/events/EventMap";
import { EventTrafficAnalysis } from "@/components/events/EventTrafficAnalysis";
import { EventPredictions } from "@/components/events/EventPredictions";

const Events = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Event Map */}
          <div className="flex-1 relative">
            <EventMap />
          </div>
          
          {/* Event Analysis Panel */}
          <div className="w-96 bg-gradient-card/50 backdrop-blur-glass border-l border-border/50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-xl font-semibold">Event Traffic Management</h2>
              <p className="text-sm text-muted-foreground">Real-time analysis and predictions</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <EventPredictions />
                <EventTrafficAnalysis />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;