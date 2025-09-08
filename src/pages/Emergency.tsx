import { Sidebar } from "@/components/dashboard/Sidebar";

const Emergency = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Emergency Response</h1>
          <p className="text-2xl text-muted-foreground mb-2">Coming Soon</p>
          <p className="text-lg text-muted-foreground italic">(let him cook)</p>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
