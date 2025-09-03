import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WeatherMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [map, setMap] = useState<any>(null);

  const initializeMap = async (token: string) => {
    if (!mapContainer.current || !token) return;

    try {
      // Dynamically import mapbox-gl to avoid SSR issues
      const mapboxgl = await import('mapbox-gl');
      
      mapboxgl.default.accessToken = token;
      
      const mapInstance = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.006, 40.7128], // NYC coordinates
        zoom: 10,
        pitch: 45,
      });

      mapInstance.on('load', () => {
        // Add weather radar layer
        mapInstance.addSource('weather-radar', {
          type: 'raster',
          tiles: [
            'https://tilecache.rainviewer.com/v2/radar/{z}/{x}/{y}/2/1_1.png'
          ],
          tileSize: 256
        });

        mapInstance.addLayer({
          id: 'weather-layer',
          type: 'raster',
          source: 'weather-radar',
          paint: {
            'raster-opacity': 0.7
          }
        });

        // Add precipitation prediction overlay
        mapInstance.addSource('precipitation-forecast', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [-74.1, 40.6],
                    [-73.9, 40.6],
                    [-73.9, 40.8],
                    [-74.1, 40.8],
                    [-74.1, 40.6]
                  ]]
                },
                properties: {
                  intensity: 'heavy'
                }
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [-74.2, 40.7],
                    [-74.0, 40.7],
                    [-74.0, 40.9],
                    [-74.2, 40.9],
                    [-74.2, 40.7]
                  ]]
                },
                properties: {
                  intensity: 'moderate'
                }
              }
            ]
          }
        });

        mapInstance.addLayer({
          id: 'precipitation-heavy',
          type: 'fill',
          source: 'precipitation-forecast',
          filter: ['==', ['get', 'intensity'], 'heavy'],
          paint: {
            'fill-color': '#dc2626',
            'fill-opacity': 0.4
          }
        });

        mapInstance.addLayer({
          id: 'precipitation-moderate',
          type: 'fill',
          source: 'precipitation-forecast',
          filter: ['==', ['get', 'intensity'], 'moderate'],
          paint: {
            'fill-color': '#f59e0b',
            'fill-opacity': 0.3
          }
        });

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
      });

      setMap(mapInstance);
      setShowTokenInput(false);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      initializeMap(mapboxToken.trim());
    }
  };

  return (
    <div className="relative w-full h-full">
      {showTokenInput && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg border max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Enter Mapbox Token</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get your free Mapbox public token at{' '}
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
            </p>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
                <Input
                  id="mapbox-token"
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full">
                Load Weather Map
              </Button>
            </form>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {!showTokenInput && (
        <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg p-3 border">
          <h3 className="font-medium text-sm mb-2">Weather Layers</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive/40 rounded"></div>
              <span>Heavy Rain Forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500/30 rounded"></div>
              <span>Moderate Rain Forecast</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}