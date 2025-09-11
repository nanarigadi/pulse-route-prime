import { Sidebar } from "@/components/dashboard/Sidebar";
import SettingsPanel from "@/components/settings/SettingsPanel";

const Settings = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          <div className="bg-gradient-card border border-border/50 rounded-lg">
            <SettingsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;


