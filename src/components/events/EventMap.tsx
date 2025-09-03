import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function EventMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [map, setMap] = useState<any>(null);

  const initializeMap = async (token: string) => {
    if (!mapContainer.current || !token) return;

    try {
      const mapboxgl = await import('mapbox-gl');
      
      mapboxgl.default.accessToken = token;
      
      const mapInstance = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.006, 40.7128],
        zoom: 12,
        pitch: 45,
      });

      mapInstance.on('load', () => {
        // Add traffic layer
        mapInstance.addSource('traffic', {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1'
        });

        mapInstance.addLayer({
          id: 'traffic-layer',
          type: 'line',
          source: 'traffic',
          'source-layer': 'traffic',
          paint: {
            'line-width': [
              'case',
              ['==', ['get', 'congestion'], 'low'], 2,
              ['==', ['get', 'congestion'], 'moderate'], 3,
              ['==', ['get', 'congestion'], 'heavy'], 4,
              ['==', ['get', 'congestion'], 'severe'], 5,
              1
            ],
            'line-color': [
              'case',
              ['==', ['get', 'congestion'], 'low'], '#22c55e',
              ['==', ['get', 'congestion'], 'moderate'], '#eab308',
              ['==', ['get', 'congestion'], 'heavy'], '#f97316',
              ['==', ['get', 'congestion'], 'severe'], '#dc2626',
              '#6b7280'
            ]
          }
        });

        // Add event locations
        mapInstance.addSource('events', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [-74.0, 40.73]
                },
                properties: {
                  name: 'Madison Square Garden Concert',
                  type: 'Concert',
                  status: 'ongoing',
                  capacity: 20000,
                  expected_attendees: 18500,
                  start_time: '19:00',
                  end_time: '23:00'
                }
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [-73.99, 40.72]
                },
                properties: {
                  name: 'Yankees Game',
                  type: 'Sports',
                  status: 'upcoming',
                  capacity: 54000,
                  expected_attendees: 51000,
                  start_time: '19:30',
                  end_time: '22:30'
                }
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [-74.01, 40.71]
                },
                properties: {
                  name: 'Street Festival',
                  type: 'Festival',
                  status: 'ongoing',
                  capacity: 15000,
                  expected_attendees: 12000,
                  start_time: '10:00',
                  end_time: '20:00'
                }
              }
            ]
          }
        });

        // Add event markers
        mapInstance.addLayer({
          id: 'events-layer',
          type: 'circle',
          source: 'events',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'expected_attendees'],
              1000, 8,
              50000, 20
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'status'], 'ongoing'], '#dc2626',
              ['==', ['get', 'status'], 'upcoming'], '#f59e0b',
              ['==', ['get', 'status'], 'ended'], '#22c55e',
              '#6b7280'
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add event impact zones
        mapInstance.addSource('impact-zones', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [-74.02, 40.71],
                    [-73.98, 40.71],
                    [-73.98, 40.75],
                    [-74.02, 40.75],
                    [-74.02, 40.71]
                  ]]
                },
                properties: {
                  impact: 'high',
                  event: 'Madison Square Garden Concert'
                }
              },
              {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [-74.01, 40.70],
                    [-73.97, 40.70],
                    [-73.97, 40.74],
                    [-74.01, 40.74],
                    [-74.01, 40.70]
                  ]]
                },
                properties: {
                  impact: 'medium',
                  event: 'Yankees Game'
                }
              }
            ]
          }
        });

        mapInstance.addLayer({
          id: 'impact-zones-layer',
          type: 'fill',
          source: 'impact-zones',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'impact'], 'high'], '#dc2626',
              ['==', ['get', 'impact'], 'medium'], '#f59e0b',
              ['==', ['get', 'impact'], 'low'], '#22c55e',
              '#6b7280'
            ],
            'fill-opacity': 0.1
          }
        });

        mapInstance.addLayer({
          id: 'impact-zones-outline',
          type: 'line',
          source: 'impact-zones',
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'impact'], 'high'], '#dc2626',
              ['==', ['get', 'impact'], 'medium'], '#f59e0b',
              ['==', ['get', 'impact'], 'low'], '#22c55e',
              '#6b7280'
            ],
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });

        // Add click events
        mapInstance.on('click', 'events-layer', (e) => {
          const features = e.features;
          if (!features || features.length === 0) return;

          const properties = features[0].properties;
          new mapboxgl.default.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${properties?.name}</h3>
                <p><strong>Type:</strong> ${properties?.type}</p>
                <p><strong>Status:</strong> ${properties?.status}</p>
                <p><strong>Expected Attendees:</strong> ${properties?.expected_attendees?.toLocaleString()}</p>
                <p><strong>Time:</strong> ${properties?.start_time} - ${properties?.end_time}</p>
              </div>
            `)
            .addTo(mapInstance);
        });

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
                Load Event Map
              </Button>
            </form>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {!showTokenInput && (
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 border">
          <h3 className="font-medium text-sm mb-3">Live Events & Traffic</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>Ongoing Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span>Upcoming Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Ended Events</span>
            </div>
            <hr className="my-2 border-border/50" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-emerald-500"></div>
              <span>Light Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-amber-500"></div>
              <span>Moderate Traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-destructive"></div>
              <span>Heavy Traffic</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}