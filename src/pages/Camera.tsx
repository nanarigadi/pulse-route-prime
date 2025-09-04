import { Sidebar } from "@/components/dashboard/Sidebar";

const Camera = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Live Camera Feed</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Camera;
