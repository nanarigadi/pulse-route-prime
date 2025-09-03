import { Sidebar } from "@/components/dashboard/Sidebar";
import { WeatherMap } from "@/components/weather/WeatherMap";
import { CongestionAlerts } from "@/components/weather/CongestionAlerts";

const Weather = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Weather Map */}
          <div className="flex-1 relative">
            <WeatherMap />
            <CongestionAlerts />
          </div>
          
          {/* Weather Info Panel */}
          <div className="w-80 bg-gradient-card/50 backdrop-blur-glass border-l border-border/50 p-4 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Weather Forecast</h2>
            
            <div className="space-y-4">
              <div className="bg-background/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Current Conditions</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Temperature: 22°C</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Humidity: 65%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Wind: 8 km/h NW</span>
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Rain Prediction</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Next Hour</span>
                    <span className="text-destructive">Heavy Rain - 85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next 3 Hours</span>
                    <span className="text-amber-500">Moderate Rain - 60%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next 6 Hours</span>
                    <span className="text-muted-foreground">Light Rain - 30%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-background/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Traffic Impact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <span>Highway A1 - Expected 40% speed reduction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Downtown Core - Expected 25% slower</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Tunnel Routes - Minimal impact</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;