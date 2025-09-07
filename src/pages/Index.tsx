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
        {/* Map Section - Expanded to match analytics panel height */}
        <div className="flex-1 pl-4 pr-2 py-4">
          <MapSection />
        </div>
        
        {/* Analytics Panel - Fixed width, full height */}
        <div className="w-72">
          <AnalyticsPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
