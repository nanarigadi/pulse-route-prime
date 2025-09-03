import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

const Analytics = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p className="text-muted-foreground">Detailed traffic analytics and insights coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;