// src/components/weather/Weather.tsx
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import WeatherMap from "@/components/weather/WeatherMap";

type WeatherData = {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string | null;
};

type RainForecast = {
  nextHour: string;
  next3Hours: string;
  next6Hours: string;
};

type TrafficImpact = {
  label: string;
  status: "danger" | "warning" | "success";
  impact: string;
};

const API_KEY = "160c77a3f7bdfc5b9a9098499af1846a";
const ODISHA_COORDS = [20.2961, 85.8245]; // Bhubaneswar, Odisha

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [rainForecast, setRainForecast] = useState<RainForecast | null>(null);
  const [trafficImpact, setTrafficImpact] = useState<TrafficImpact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      try {
        // --- Current Weather ---
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${ODISHA_COORDS[0]}&lon=${ODISHA_COORDS[1]}&units=metric&appid=${API_KEY}`
        );
        const weatherJson = await weatherRes.json();

        if (weatherJson?.main && weatherJson?.wind) {
          const degToCardinal = (deg: number) => {
            const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
            const index = Math.round((deg % 360) / 45);
            return directions[index % 8];
          };

          setWeatherData({
            temperature: weatherJson.main.temp ?? null,
            humidity: weatherJson.main.humidity ?? null,
            windSpeed: weatherJson.wind.speed ?? null,
            windDirection: weatherJson.wind.deg
              ? degToCardinal(weatherJson.wind.deg)
              : null,
          });
        } else {
          setWeatherData(null);
        }

        // --- Rain Forecast ---
        const rainRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${ODISHA_COORDS[0]}&longitude=${ODISHA_COORDS[1]}&hourly=precipitation&forecast_days=1`
        );
        const rainJson = await rainRes.json();
        const rainData: number[] = rainJson?.hourly?.precipitation ?? [];

        const categorizeRain = (mm: number | undefined) => {
          if (mm === undefined) return "No Data";
          if (mm > 4) return `Heavy Rain - ${mm} mm`;
          if (mm > 1) return `Moderate Rain - ${mm} mm`;
          if (mm > 0) return `Light Rain - ${mm} mm`;
          return "No Rain";
        };

        const nextHourRain = rainData?.[0] ?? 0;
        const next3HoursRain = rainData?.[2] ?? 0;
        const next6HoursRain = rainData?.[5] ?? 0;

        setRainForecast({
          nextHour: categorizeRain(nextHourRain),
          next3Hours: categorizeRain(next3HoursRain),
          next6Hours: categorizeRain(next6HoursRain),
        });

        // --- Traffic Impact ---
        const getTrafficImpact = (rain: number): TrafficImpact[] => {
          if (rain === 0) {
            return [
              { label: "Highways", status: "success" as const, impact: "No delays expected" },
              { label: "Downtown", status: "success" as const, impact: "Minimal impact" },
              { label: "Local Roads", status: "success" as const, impact: "Normal flow" },
            ];
          } else if (rain > 4) {
            return [
              { label: "Highways", status: "danger" as const, impact: "Major congestion expected" },
              { label: "Downtown", status: "danger" as const, impact: "Flooding risk, avoid travel" },
              { label: "Local Roads", status: "warning" as const, impact: "Possible closures" },
            ];
          } else if (rain > 1) {
            return [
              { label: "Highways", status: "warning" as const, impact: "Slower speeds, minor delays" },
              { label: "Downtown", status: "warning" as const, impact: "Increased travel time" },
              { label: "Local Roads", status: "success" as const, impact: "Mostly normal" },
            ];
          } else {
            return [
              { label: "Highways", status: "warning" as const, impact: "Slightly reduced speed" },
              { label: "Downtown", status: "success" as const, impact: "Minimal impact" },
              { label: "Local Roads", status: "success" as const, impact: "Normal flow" },
            ];
          }
        };

        setTrafficImpact(getTrafficImpact(nextHourRain));
      } catch (error) {
        console.error("Failed to fetch weather data:", error);
        setWeatherData(null);
        setRainForecast(null);
        setTrafficImpact([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "danger":
        return "bg-destructive";
      case "warning":
        return "bg-amber-500";
      case "success":
        return "bg-emerald-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Weather Map */}
          <div className="flex-1 relative">
            <WeatherMap />
          </div>

          {/* Info Panel */}
          <div className="w-80 bg-gradient-card/50 backdrop-blur-glass border-l border-border/50 p-4 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Weather Forecast</h2>

            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading weather data...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Conditions */}
                <div className="bg-background/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Current Conditions</h3>
                  {weatherData ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Temperature: {weatherData.temperature ?? "N/A"}°C
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Humidity: {weatherData.humidity ?? "N/A"}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Wind: {weatherData.windSpeed ?? "N/A"} m/s{" "}
                        {weatherData.windDirection ?? ""}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">Weather data not available.</p>
                  )}
                </div>

                {/* Rain Forecast */}
                <div className="bg-background/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Rain Prediction</h3>
                  {rainForecast ? (
                    <>
                      <p className="text-sm flex justify-between">
                        <span>Next Hour</span>
                        <span>{rainForecast.nextHour}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span>Next 3 Hours</span>
                        <span>{rainForecast.next3Hours}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span>Next 6 Hours</span>
                        <span>{rainForecast.next6Hours}</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">Rain forecast not available.</p>
                  )}
                </div>

                {/* Traffic Impact */}
                <div className="bg-background/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Traffic Impact</h3>
                  {trafficImpact.length > 0 ? (
                    trafficImpact.map((item, i) => (
                      <p key={i} className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-2 h-2 rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        ></span>
                        {item.label} - {item.impact}
                      </p>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Traffic data not available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
