import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function SimpleTrafficMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const nodesLayerRef = useRef<L.LayerGroup | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [20.2961, 85.8245],
      zoom: 13,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create nodes layer
    const nodesLayer = L.layerGroup().addTo(map);
    
    mapInstanceRef.current = map;
    nodesLayerRef.current = nodesLayer;

    // Generate initial traffic nodes
    generateTrafficNodes();

    // Auto-refresh every 30 seconds
    const interval = setInterval(generateTrafficNodes, 30000);

    return () => {
      clearInterval(interval);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const generateTrafficNodes = () => {
    if (!nodesLayerRef.current) return;

    nodesLayerRef.current.clearLayers();

    // Generate random traffic nodes around Bhubaneswar
    const centerLat = 20.2961;
    const centerLng = 85.8245;
    const nodeCount = 50;

    for (let i = 0; i < nodeCount; i++) {
      // Random position within city bounds
      const lat = centerLat + (Math.random() - 0.5) * 0.1;
      const lng = centerLng + (Math.random() - 0.5) * 0.1;
      
      // Random severity
      const rand = Math.random();
      let color, severity;
      if (rand < 0.25) {
        color = '#ef4444';
        severity = 'High';
      } else if (rand < 0.6) {
        color = '#f59e0b';
        severity = 'Moderate';
      } else {
        color = '#22c55e';
        severity = 'Low';
      }

      // Create circle marker
      L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
      })
      .bindPopup(`Traffic: ${severity}<br>Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      .addTo(nodesLayerRef.current!);
    }
  };

  const handleRefresh = () => {
    generateTrafficNodes();
    toast({
      title: "Map Refreshed",
      description: "Traffic data has been updated",
    });
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full rounded-lg" style={{ minHeight: '400px' }} />
      
      {/* Controls */}
      <Button
        onClick={handleRefresh}
        size="sm"
        className="absolute top-4 left-4 z-[1000] h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

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
    </div>
  );
}
