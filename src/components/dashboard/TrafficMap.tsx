import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';
import { useVideoState } from '@/hooks/useVideoState';
import { RefreshCw, ZoomIn, ZoomOut, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TrafficNodeService from '@/lib/trafficNodeService';
import { TrafficNotifications } from './TrafficNotifications';

// Fix for default markers in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create a custom icon to ensure it displays properly
const createCustomIcon = () => {
  return L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

interface TrafficNode {
  lat: number;
  lng: number;
  severity: 'red' | 'yellow' | 'green';
  radius: number;
  video: string;
}

interface RoadGeometry {
  latlngs: [number, number][];
  lengthMeters: number;
}

const videos = [
  '/videos/V1.mp4',
  '/videos/V2.mp4',
  '/videos/V3.mp4',
  '/videos/V4.mp4',
  '/videos/V5.mp4',
  '/videos/V6.mp4',
  '/videos/V7.mp4',
  '/videos/V8.mp4',
];

export function TrafficMap() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setVideos } = useVideoState();
  const mapInstanceRef = useRef<L.Map | null>(null);
  const roadsLayerRef = useRef<L.LayerGroup | null>(null);
  const nodesLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const roadGeometriesRef = useRef<{ latlngs: [number, number][]; lengthMeters: number }[]>([]);
  const currentNodesRef = useRef<TrafficNode[]>([]);
  const lastRoadsBboxKeyRef = useRef<string>('');
  const roadsFetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const currentCircleRef = useRef<L.Circle | null>(null);
  const lastClickedLocationRef = useRef<[number, number] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Get traffic node service instance
  const trafficNodeService = TrafficNodeService.getInstance();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Define strict geographical boundaries for Bhubaneswar city only
    const corner1 = L.latLng(20.20, 85.75);
    const corner2 = L.latLng(20.40, 85.90);
    const bounds = L.latLngBounds(corner1, corner2);

    // Initialize map with Bhubaneswar bounds
    const map = L.map(mapRef.current, {
      center: [20.2961, 85.8245],
      zoom: 13,
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      minZoom: 12,
      maxZoom: 18,
      zoomControl: false
    });

    mapInstanceRef.current = map;

    // Create panes for proper layering
    map.createPane('roadsPane');
    map.getPane('roadsPane')!.style.zIndex = '450';
    map.getPane('roadsPane')!.style.pointerEvents = 'none';
    map.getPane('roadsPane')!.style.opacity = '0';

    map.createPane('nodesPane');
    map.getPane('nodesPane')!.style.zIndex = '500';
    map.getPane('nodesPane')!.style.pointerEvents = 'none';
    map.getPane('nodesPane')!.style.opacity = '1';

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Initialize layers
    roadsLayerRef.current = L.layerGroup().addTo(map);
    nodesLayerRef.current = L.layerGroup().addTo(map);
    userMarkersLayerRef.current = L.layerGroup().addTo(map);

    // Helper functions
    const getRoadWeight = () => {
      const z = map.getZoom();
      if (z >= 16) return 3;
      if (z >= 15) return 2.5;
      if (z >= 14) return 2;
      return 1.5;
    };

    const bboxKey = (bounds: L.LatLngBounds) => {
      const s = bounds.getSouth().toFixed(5);
      const w = bounds.getWest().toFixed(5);
      const n = bounds.getNorth().toFixed(5);
      const e = bounds.getEast().toFixed(5);
      return `${s},${w},${n},${e}`;
    };

    const loadRoadsForCurrentView = async () => {
      if (map.getZoom() < 12) {
        roadsLayerRef.current?.clearLayers();
        return;
      }

      const bounds = map.getBounds();
      const s = bounds.getSouth();
      const w = bounds.getWest();
      const n = bounds.getNorth();
      const e = bounds.getEast();
      const key = bboxKey(bounds);
      
      if (key === lastRoadsBboxKeyRef.current) return;
      lastRoadsBboxKeyRef.current = key;

      const overpassQuery = `[
        out:json
        ][timeout:25];
        (
          way["highway"](${s},${w},${n},${e});
        );
        out geom;
      `;

      try {
        const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(overpassQuery.replace(/\n\s+/g, " "));
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("Overpass error " + resp.status);
        const data = await resp.json();

        roadsLayerRef.current?.clearLayers();
        nodesLayerRef.current?.clearLayers();
        roadGeometriesRef.current = [];
        
        if (!data.elements) return;

        for (const el of data.elements) {
          if (el.type === "way" && Array.isArray(el.geometry) && el.geometry.length > 1) {
            const latlngs: [number, number][] = el.geometry.map((pt: any) => [pt.lat, pt.lon]);
            
            // Calculate road length
            let lengthMeters = 0;
            for (let i = 0; i < latlngs.length - 1; i++) {
              const a = L.latLng(latlngs[i][0], latlngs[i][1]);
              const b = L.latLng(latlngs[i+1][0], latlngs[i+1][1]);
              lengthMeters += a.distanceTo(b);
            }
            
            roadGeometriesRef.current.push({ latlngs, lengthMeters });

            // Add road polyline (invisible)
            L.polyline(latlngs, {
              pane: 'roadsPane',
              color: '#222222',
              weight: getRoadWeight(),
              opacity: 0.95,
              lineJoin: 'round',
              lineCap: 'round'
            }).addTo(roadsLayerRef.current!);
          }
        }

        // Update traffic service with road geometries
        trafficNodeService.setRoadGeometries(roadGeometriesRef.current);
        
        // Generate initial traffic nodes immediately after roads load
        setTimeout(() => {
          trafficNodeService.generateNodes();
        }, 100);
        
        // Start auto-refresh only once
        if (!trafficNodeService.isAutoRefreshActive) {
          trafficNodeService.startAutoRefresh();
        }
      } catch (err) {
        console.warn("Roads overlay failed:", err);
      }
    };

    const scheduleRoadsFetch = () => {
      if (roadsFetchTimerRef.current) clearTimeout(roadsFetchTimerRef.current);
      roadsFetchTimerRef.current = setTimeout(loadRoadsForCurrentView, 400);
    };

    // Traffic node generation functions
    const chooseWeightedWay = (minLengthMeters = 200) => {
      const candidates = roadGeometriesRef.current.filter(w => w.lengthMeters >= minLengthMeters);
      const pool = candidates.length > 5 ? candidates : roadGeometriesRef.current;
      if (pool.length === 0) return null;
      
      const total = pool.reduce((sum, w) => sum + Math.max(1, w.lengthMeters), 0);
      let r = Math.random() * total;
      for (const w of pool) {
        r -= Math.max(1, w.lengthMeters);
        if (r <= 0) return w;
      }
      return pool[pool.length - 1];
    };

    const randomPointOnWay = (latlngs: [number, number][]) => {
      if (latlngs.length < 2) return latlngs[0];
      const segIdx = Math.floor(Math.random() * (latlngs.length - 1));
      const a = latlngs[segIdx];
      const b = latlngs[segIdx + 1];
      const t = Math.random();
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as [number, number];
    };

    const randomSeverity = () => {
      const r = Math.random();
      if (r < 0.50) return 'red';
      return 'yellow';
    };

    const colorFor = (severity: string) => {
      if (severity === 'red') return '#ef4444';
      if (severity === 'yellow') return '#f59e0b';
      return '#f59e0b';
    };

    const radiusFor = (severity: string) => {
      if (severity === 'red') return 120;
      if (severity === 'yellow') return 100;
      return 100;
    };

    const refreshTrafficNodes = () => {
      nodesLayerRef.current?.clearLayers();
      currentNodesRef.current = [];
      
      if (roadGeometriesRef.current.length === 0) return;

      const mapSize = map.getSize();
      const mapArea = mapSize.x * mapSize.y;
      const targetCount = Math.min(150, Math.max(50, Math.floor(mapArea / 8000)));
      const minGapMeters = 15;

      const placements: { latlng: L.LatLng; radius: number }[] = [];
      const newNodes: TrafficNode[] = [];

      const maxAttempts = targetCount * 50;
      let placed = 0;
      let attempts = 0;

      while (placed < targetCount && attempts < maxAttempts) {
        attempts++;
        const severityType = randomSeverity();
        const color = colorFor(severityType);
        const areaRadius = radiusFor(severityType);
        const severityName = severityType === 'red' ? 'High' : 'Medium';

        const way = chooseWeightedWay();
        if (!way) continue;

        const p = randomPointOnWay(way.latlngs);
        const pLL = L.latLng(p[0], p[1]);

        // Collision check
        let collides = false;
        for (const existing of placements) {
          const centerDistance = pLL.distanceTo(existing.latlng);
          if (centerDistance < (areaRadius + existing.radius + minGapMeters)) {
            collides = true;
            break;
          }
        }

        if (collides) continue;

        placements.push({ latlng: pLL, radius: areaRadius });
        newNodes.push({ lat: p[0], lng: p[1], severity: severityType, radius: areaRadius, video: videos[Math.floor(Math.random() * videos.length)] });

        // Draw highlight area
        L.circle(p, {
          pane: 'nodesPane',
          radius: areaRadius,
          color: color,
          weight: 1,
          opacity: 0.0,
          fillColor: color,
          fillOpacity: 0.35
        }).addTo(nodesLayerRef.current!);

        // Draw node marker
        L.circleMarker(p, {
          pane: 'nodesPane',
          radius: 6,
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 1.0
        }).addTo(nodesLayerRef.current!);

        placed++;
      }

      currentNodesRef.current = newNodes;
    };

    let nodesTimer: NodeJS.Timeout | null = null;
    const ensureNodesAutoRefresh = () => {
      if (nodesTimer) return;
      nodesTimer = setInterval(refreshTrafficNodes, 120000); // 2 minutes
    };

    // User interaction functions
    const clearAllUserMarkers = () => {
      userMarkersLayerRef.current?.clearLayers();
      currentMarkerRef.current = null;
      currentCircleRef.current = null;
      lastClickedLocationRef.current = null;
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (currentMarkerRef.current) return;

      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      const currentLocation: [number, number] = [lat, lng];

      const clickTolerance = 0.0001;
      if (lastClickedLocationRef.current) {
        const latDiff = Math.abs(currentLocation[0] - lastClickedLocationRef.current[0]);
        const lngDiff = Math.abs(currentLocation[1] - lastClickedLocationRef.current[1]);
        
        if (latDiff < clickTolerance && lngDiff < clickTolerance) {
          clearAllUserMarkers();
          return;
        }
      }

      clearAllUserMarkers();

      currentMarkerRef.current = L.marker([lat, lng], { icon: createCustomIcon() })
        .addTo(userMarkersLayerRef.current!)
        .bindPopup(`Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .openPopup();

      lastClickedLocationRef.current = currentLocation;
    };

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
        const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!resp.ok) throw new Error('reverse geocode failed');
        const data = await resp.json();
        return data.display_name || [data.address?.suburb, data.address?.city || data.address?.town || data.address?.village, data.address?.state].filter(Boolean).join(', ');
      } catch (_) {
        return '';
      }
    };

    const handleControlSignals = async (lat: number, lng: number, locationName: string) => {
      // When a user clicks on "Control Signals", we now play a random video from the list.
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      setVideos([randomVideo]);

      // Store selected region data for camera page
      const regionData = {
        lat: lat,
        lng: lng,
        address: locationName || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        trafficLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
        vehicleCount: Math.floor(Math.random() * 50) + 10,
        lastUpdate: 'Just now'
      };
      
      localStorage.setItem('selectedRegion', JSON.stringify(regionData));
      
      // Show toast notification
      toast({
        title: "Redirecting to Selected Region",
        description: "Opening detailed view for this 1km radius area...",
        duration: 2000,
      });
      
      // Navigate to camera page
      navigate('/camera');
    };

    const handleMapDoubleClick = async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (currentCircleRef.current) {
        map.removeLayer(currentCircleRef.current);
      }

      clearAllUserMarkers();

      currentCircleRef.current = L.circle([lat, lng], {
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 2,
        opacity: 0.8,
        radius: 1000
      }).addTo(userMarkersLayerRef.current!);

      // Traffic analysis
      const center = L.latLng(lat, lng);
      let weightedSum = 0;
      let totalWeight = 0;
      let nearbyNodes = 0;

      for (const n of currentNodesRef.current) {
        const d = center.distanceTo([n.lat, n.lng]);
        if (d > 1000) continue;
        
        nearbyNodes++;
        let w = d <= 200 ? 1.0 : d <= 500 ? 0.8 : Math.max(0.3, 1 - (d - 500) / 500);
        const sevFactor = n.severity === 'red' ? 1.5 : n.severity === 'yellow' ? 1.2 : 1.0;
        w *= sevFactor;

        const score = n.severity === 'red' ? 3 : n.severity === 'yellow' ? 2 : 1;
        weightedSum += score * w;
        totalWeight += w;
      }

      const avg = totalWeight > 0 ? weightedSum / totalWeight : 1;
      const label = avg >= 2.3 ? 'High' : avg >= 1.6 ? 'Moderate' : 'Low';

      const basicPopupHtml = `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>Traffic analysis: ${label}<br><button onclick="window.handleControlSignals && window.handleControlSignals(${lat}, ${lng}, '')" style="margin-top: 8px; padding: 4px 8px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Control Signals</button>`;
      
      currentMarkerRef.current = L.marker([lat, lng], { icon: createCustomIcon() })
        .addTo(userMarkersLayerRef.current!)
        .bindPopup(basicPopupHtml)
        .openPopup();

      // Set global function for button click
      (window as any).handleControlSignals = handleControlSignals;

      // Update popup with location info asynchronously
      reverseGeocode(lat, lng).then(place => {
        if (currentMarkerRef.current && map.hasLayer(currentMarkerRef.current)) {
          const locationLine = place ? `Location: ${place}<br>` : '';
          const updatedPopupHtml = `${locationLine}Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}<br>Traffic analysis: ${label}<br><button onclick="window.handleControlSignals && window.handleControlSignals(${lat}, ${lng}, '${place || ''}')" style="margin-top: 8px; padding: 4px 8px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">Control Signals</button>`;
          currentMarkerRef.current.setPopupContent(updatedPopupHtml);
        }
      });

      lastClickedLocationRef.current = [lat, lng];
    };

    // Load initial roads and traffic
    scheduleRoadsFetch();

    // Set up event listeners - only load roads, don't refresh nodes on zoom/pan
    const loadRoadsOnly = async () => {
      if (roadsFetchTimerRef.current) clearTimeout(roadsFetchTimerRef.current);
      roadsFetchTimerRef.current = setTimeout(async () => {
        // Load roads without regenerating traffic nodes
        if (map.getZoom() < 12) {
          roadsLayerRef.current?.clearLayers();
          return;
        }

        const bounds = map.getBounds();
        const s = bounds.getSouth();
        const w = bounds.getWest();
        const n = bounds.getNorth();
        const e = bounds.getEast();
        const key = bboxKey(bounds);
        
        if (key === lastRoadsBboxKeyRef.current) return;
        lastRoadsBboxKeyRef.current = key;

        const overpassQuery = `[
          out:json
          ][timeout:25];
          (
            way["highway"](${s},${w},${n},${e});
          );
          out geom;
        `;

        try {
          const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(overpassQuery.replace(/\n\s+/g, " "));
          const resp = await fetch(url);
          if (!resp.ok) throw new Error("Overpass error " + resp.status);
          const data = await resp.json();

          roadsLayerRef.current?.clearLayers();
          roadGeometriesRef.current = [];
          
          if (!data.elements) return;

          for (const el of data.elements) {
            if (el.type === "way" && Array.isArray(el.geometry) && el.geometry.length > 1) {
              const latlngs: [number, number][] = el.geometry.map((pt: any) => [pt.lat, pt.lon]);
              
              // Calculate road length
              let lengthMeters = 0;
              for (let i = 0; i < latlngs.length - 1; i++) {
                const a = L.latLng(latlngs[i][0], latlngs[i][1]);
                const b = L.latLng(latlngs[i+1][0], latlngs[i+1][1]);
                lengthMeters += a.distanceTo(b);
              }
              
              roadGeometriesRef.current.push({ latlngs, lengthMeters });

              // Add road polyline (invisible)
              L.polyline(latlngs, {
                pane: 'roadsPane',
                color: '#222222',
                weight: getRoadWeight(),
                opacity: 0.95,
                lineJoin: 'round',
                lineCap: 'round'
              }).addTo(roadsLayerRef.current!);
            }
          }

          // Update service with new road geometries but don't regenerate nodes
          trafficNodeService.setRoadGeometries(roadGeometriesRef.current);
        } catch (err) {
          console.warn("Roads overlay failed:", err);
        }
      }, 400);
    };
    
    map.on('moveend', loadRoadsOnly);
    map.on('zoomend', loadRoadsOnly);
    map.on('click', handleMapClick);
    map.on('dblclick', handleMapDoubleClick);

    // Subscribe to traffic node updates and render them
    const displayTrafficNodes = (nodes: any[]) => {
      if (!nodesLayerRef.current) return;

      nodesLayerRef.current.clearLayers();
      currentNodesRef.current = nodes;

      nodes.forEach((node) => {
        const color = node.severity === 'red' ? '#ef4444' : '#f59e0b';

        // Draw highlight area
        L.circle([node.lat, node.lng], {
          pane: 'nodesPane',
          radius: node.radius,
          color: color,
          weight: 1,
          opacity: 0.0,
          fillColor: color,
          fillOpacity: 0.35
        }).addTo(nodesLayerRef.current!);

        // Draw node marker
        L.circleMarker([node.lat, node.lng], {
          pane: 'nodesPane',
          radius: 6,
          color: color,
          weight: 2,
          opacity: 1.0,
          fillColor: color,
          fillOpacity: 0.8
        }).addTo(nodesLayerRef.current!);
      });
    };

    const unsubscribe = trafficNodeService.subscribe(displayTrafficNodes);

    return () => {
      unsubscribe();
      trafficNodeService.stopAutoRefresh();
      if (roadsFetchTimerRef.current) clearTimeout(roadsFetchTimerRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [toast]);

  const handleRefresh = () => {
    if (!mapInstanceRef.current) return;
    
    // Clear all user markers
    if (userMarkersLayerRef.current) {
      userMarkersLayerRef.current.clearLayers();
    }
    currentMarkerRef.current = null;
    currentCircleRef.current = null;
    lastClickedLocationRef.current = null;
    
    // Refresh traffic nodes through service
    trafficNodeService.refresh();
    
    toast({
      title: "Map Refreshed",
      description: "Traffic data has been updated",
    });
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
    toast({
      title: "Zoomed In",
      description: "Map has been zoomed in",
    });
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full rounded-lg" style={{ minHeight: '400px' }} />
      
      {/* Refresh Button - Moved to top left where search bar was */}
      <Button
        onClick={handleRefresh}
        size="sm"
        className="absolute top-4 left-4 z-[1000] h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
        title="Refresh traffic data"
        aria-label="Refresh traffic heatmap data"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
        <Button
          onClick={handleZoomIn}
          size="sm"
          variant="secondary"
          className="h-10 w-10"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          size="sm"
          variant="secondary"
          className="h-10 w-10"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Traffic Notifications - Inside Map */}
      <TrafficNotifications />
    </div>
  );
}
