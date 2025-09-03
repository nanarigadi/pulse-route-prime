import { Sidebar } from "@/components/dashboard/Sidebar";
import { MapSection } from "@/components/dashboard/MapSection";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";

const Index = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 p-4">
          <MapSection />
        </div>
        
        {/* Analytics Panel */}
        <AnalyticsPanel />
      </div>
    </div>
  );
};

export default Index;
