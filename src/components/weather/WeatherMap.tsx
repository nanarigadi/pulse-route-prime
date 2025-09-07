// src/components/weather/WeatherMap.tsx
// @ts-nocheck
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// Fix Leaflet marker icon issue in React
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12.5, 41], // ✅ Fix for pinpoint accuracy
  popupAnchor: [0, -41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// OpenWeatherMap API key
const API_KEY = "160c77a3f7bdfc5b9a9098499af1846a";

// Handle clicks on the map
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

const WeatherMap = () => {
  const odishaCoords: [number, number] = [20.2961, 85.8245]; // Bhubaneswar
  const [overlay, setOverlay] = useState<"rain" | "clouds" | "temp">("rain");
  const [weather, setWeather] = useState<any>(null);
  const [clickData, setClickData] = useState<any>(null);

  // Fetch live weather for Odisha (Bhubaneswar)
  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${odishaCoords[0]}&lon=${odishaCoords[1]}&units=metric&appid=${API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather({
          temperature: data.main.temp,
          windspeed: data.wind.speed,
          time: new Date(data.dt * 1000).toLocaleTimeString(),
        });
      })
      .catch((err) => console.error("Weather fetch failed", err));
  }, []);

  // ✅ Overlay URLs (OpenWeatherMap)
  const overlayUrls: Record<string, string> = {
    rain: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
    clouds: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
    temp: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
  };

  // ✅ Handle clicks for rainfall data
  const handleMapClick = async (latlng: { lat: number; lng: number }) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latlng.lat}&longitude=${latlng.lng}&hourly=precipitation`
      );
      const data = await res.json();
      setClickData({
        coords: latlng,
        rain: data?.hourly?.precipitation?.[0] ?? "N/A",
      });
    } catch (err) {
      console.error("Rain fetch failed", err);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Toggle Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/80 p-2 rounded shadow space-x-2"> {/* ✅ Moved controls to the right */}
        <Button
          variant={overlay === "rain" ? "default" : "outline"}
          size="sm"
          onClick={() => setOverlay("rain")}
        >
          Rain
        </Button>
        <Button
          variant={overlay === "clouds" ? "default" : "outline"}
          size="sm"
          onClick={() => setOverlay("clouds")}
        >
          Clouds
        </Button>
        <Button
          variant={overlay === "temp" ? "default" : "outline"}
          size="sm"
          onClick={() => setOverlay("temp")}
        >
          Temp
        </Button>
      </div>

      {/* Map */}
      <MapContainer
        center={odishaCoords}
        zoom={7}
        style={{ height: "100%", width: "100%", borderRadius: "12px" }}
      >
        {/* Base OSM tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Dynamic Weather Overlay */}
        {overlay && (
          <TileLayer
            key={overlay}
            url={overlayUrls[overlay]}
            attribution="&copy; OpenWeatherMap"
            opacity={0.6}
          />
        )}

        {/* Marker for Odisha capital weather */}
        {weather && (
          <Marker position={odishaCoords}>
            <Popup>
              <div>
                <h3 className="font-semibold">Bhubaneswar Weather</h3>
                <p>🌡 Temp: {weather.temperature}°C</p>
                <p>💨 Wind: {weather.windspeed} m/s</p>
                <p>⏰ Time: {weather.time}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Click handler for coordinates + rain forecast */}
        <ClickHandler onClick={handleMapClick} />

        {clickData && (
          <Marker position={[clickData.coords.lat, clickData.coords.lng]}>
            <Popup>
              <div>
                <h3 className="font-semibold">Clicked Location</h3>
                <p>📍 Lat: {clickData.coords.lat.toFixed(4)}</p>
                <p>📍 Lng: {clickData.coords.lng.toFixed(4)}</p>
                <p>🌧 Rain (next hr): {clickData.rain} mm</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default WeatherMap;