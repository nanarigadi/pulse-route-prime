import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin,
  AlertTriangle,
  Car,
  RefreshCw,
  Expand,
  X,
  Plus,
  Minus,
  Maximize2,
  Activity
} from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TrafficNodeService from '@/lib/trafficNodeService';
import { useVideoState } from '@/hooks/useVideoState';

interface SelectedRegion {
  lat: number;
  lng: number;
  address: string;
  trafficLevel: 'Low' | 'Medium' | 'High';
  vehicleCount: number;
  lastUpdate: string;
}

interface TrafficNode {
  lat: number;
  lng: number;
  severity: 'red' | 'yellow';
  radius: number;
}

const VideoPlayer = ({ videos, initialTime, onTimeUpdate }: { videos: string[], initialTime: number, onTimeUpdate: (time: number) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = videos[0];
      videoRef.current.currentTime = initialTime;
      videoRef.current.play();
    }
  }, [videos, initialTime]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        onTimeUpdate={() => {
          if (videoRef.current) {
            onTimeUpdate(videoRef.current.currentTime);
          }
        }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const Camera = () => {
  const [selectedRegion, setSelectedRegion] = useState<SelectedRegion | null>(null);
  const [trafficNodes, setTrafficNodes] = useState<TrafficNode[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const videoTimeRef = useRef(0);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const nodesLayerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const { videos } = useVideoState();

  useEffect(() => {
    const storedRegion = localStorage.getItem('selectedRegion');
    if (storedRegion) {
      const region = JSON.parse(storedRegion);
      setSelectedRegion(region);
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    if (selectedRegion && mapRef.current && !mapInstanceRef.current) {
      setTimeout(() => {
        unsubscribe = initializeMap();
      }, 100);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedRegion, expandedCard]);

  const initializeMap = () => {
    if (!selectedRegion || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const savedMapState = JSON.parse(localStorage.getItem('mapState') || '{}');

    const mapCenter = savedMapState.center || L.latLng(selectedRegion.lat, selectedRegion.lng);
    const mapZoom = savedMapState.zoom || 16;

    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
      attributionControl: true,
      maxZoom: 17,
      minZoom: 15,
      preferCanvas: false,
    });

    map.on('moveend', () => {
      localStorage.setItem('mapState', JSON.stringify({ center: map.getCenter(), zoom: map.getZoom() }));
    });

    map.on('zoomend', () => {
      localStorage.setItem('mapState', JSON.stringify({ center: map.getCenter(), zoom: map.getZoom() }));
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap contributors'
    }).addTo(map);

    map.createPane('circlePane');
    map.getPane('circlePane')!.style.zIndex = '400';
    map.createPane('nodesPane');
    map.getPane('nodesPane')!.style.zIndex = '450';

    circleRef.current = L.circle([selectedRegion.lat, selectedRegion.lng], {
      pane: 'circlePane',
      radius: 1000,
      color: '#3b82f6',
      weight: 2,
      opacity: 0.8,
      fillColor: '#3b82f6',
      fillOpacity: 0.1
    }).addTo(map);

    nodesLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    const trafficNodeService = TrafficNodeService.getInstance();
    const serviceCenter = L.latLng(selectedRegion.lat, selectedRegion.lng);
  
    const displayTrafficNodes = (nodes: any[]) => {
      if (!nodesLayerRef.current) return;
      
      nodesLayerRef.current.clearLayers();

      nodes.forEach((node) => {
        const color = node.severity === 'red' ? '#ef4444' : '#f59e0b';
        
        L.circle([node.lat, node.lng], {
          pane: 'nodesPane',
          radius: node.radius,
          color: color,
          weight: 1,
          opacity: 0.0,
          fillColor: color,
          fillOpacity: 0.35
        }).addTo(nodesLayerRef.current!);

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
  
    const unsubscribe = trafficNodeService.subscribe((nodes) => {
      const nodesInRadius = trafficNodeService.getNodesInRadius(serviceCenter, 1000);
      displayTrafficNodes(nodesInRadius);
      setTrafficNodes(nodesInRadius);
    });

    setTimeout(() => {
      const currentNodes = trafficNodeService.getCurrentNodes();
      const nodesInRadius = trafficNodeService.getNodesInRadius(serviceCenter, 1000);
      displayTrafficNodes(nodesInRadius);
      setTrafficNodes(nodesInRadius);
      map.invalidateSize();
    }, 300);

    return unsubscribe;
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

  const handleRefresh = () => {
    const trafficNodeService = TrafficNodeService.getInstance();
    trafficNodeService.refresh();
  };

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const ExpandedView = () => {
    const expandedMapRef = useRef<HTMLDivElement>(null);
    const expandedMapInstanceRef = useRef<L.Map | null>(null);
    const expandedNodesLayerRef = useRef<L.LayerGroup | null>(null);

    React.useEffect(() => {
      if (expandedCard === 'camera3') return;
      if (!expandedMapRef.current || expandedMapInstanceRef.current || !selectedRegion) return;

      const timer = setTimeout(() => {
        if (!selectedRegion || !expandedMapRef.current) return;

        const mapCenter = L.latLng(selectedRegion.lat, selectedRegion.lng);
        const radius = 1000;
        const mapBounds = mapCenter.toBounds(radius * 2);
        
        const map = L.map(expandedMapRef.current, {
          center: [selectedRegion.lat, selectedRegion.lng],
          zoom: 16,
          zoomControl: false,
          attributionControl: true,
          maxZoom: 17,
          minZoom: 15,
          preferCanvas: false,
          maxBounds: mapBounds,
          maxBoundsViscosity: 1.0
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'OpenStreetMap contributors'
        }).addTo(map);

        map.createPane('circlePane');
        map.getPane('circlePane')!.style.zIndex = '400';
        map.createPane('nodesPane');
        map.getPane('nodesPane')!.style.zIndex = '450';

        map.fitBounds(mapBounds, { padding: [10, 10] });

        expandedNodesLayerRef.current = L.layerGroup().addTo(map);
        expandedMapInstanceRef.current = map;

        const trafficNodeService = TrafficNodeService.getInstance();
        const serviceCenter = L.latLng(selectedRegion.lat, selectedRegion.lng);
      
        const displayTrafficNodes = (nodes: any[]) => {
          if (!expandedNodesLayerRef.current) return;
          expandedNodesLayerRef.current.clearLayers();

          nodes.forEach((node) => {
            const color = node.severity === 'red' ? '#ef4444' : '#f59e0b';
            
            L.circle([node.lat, node.lng], {
              pane: 'nodesPane',
              radius: node.radius,
              color: color,
              weight: 1,
              opacity: 0.0,
              fillColor: color,
              fillOpacity: 0.35
            }).addTo(expandedNodesLayerRef.current!);

            L.circleMarker([node.lat, node.lng], {
              pane: 'nodesPane',
              radius: 6,
              color: color,
              weight: 2,
              opacity: 1.0,
              fillColor: color,
              fillOpacity: 0.8
            }).addTo(expandedNodesLayerRef.current!);
          });
        };
      
        const unsubscribe = trafficNodeService.subscribe((nodes) => {
          const nodesInRadius = trafficNodeService.getNodesInRadius(serviceCenter, 1000);
          displayTrafficNodes(nodesInRadius);
        });

        setTimeout(() => {
          const currentNodes = trafficNodeService.getCurrentNodes();
          const nodesInRadius = trafficNodeService.getNodesInRadius(serviceCenter, 1000);
          displayTrafficNodes(nodesInRadius);
          map.invalidateSize();
        }, 300);

        return () => {
          if (unsubscribe) unsubscribe();
          if (expandedMapInstanceRef.current) {
            expandedMapInstanceRef.current.remove();
            expandedMapInstanceRef.current = null;
          }
        };
      }, 100);

      return () => {
        clearTimeout(timer);
        if (expandedMapInstanceRef.current) {
          expandedMapInstanceRef.current.remove();
          expandedMapInstanceRef.current = null;
        }
      };
    }, [selectedRegion]);

    const handleExpandedZoomIn = () => {
      if (expandedMapInstanceRef.current) {
        expandedMapInstanceRef.current.zoomIn();
      }
    };

    const handleExpandedZoomOut = () => {
      if (expandedMapInstanceRef.current) {
        expandedMapInstanceRef.current.zoomOut();
      }
    };

    const handleExpandedRefresh = () => {
      const trafficNodeService = TrafficNodeService.getInstance();
      trafficNodeService.refresh();
    };

    if (expandedCard === 'camera3') {
      return (
        <div className="h-screen flex bg-background overflow-hidden animate-in fade-in-0 slide-in-from-right-4 duration-300">
          <Sidebar />
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Camera 3 - Expanded View</h1>
                <p className="text-muted-foreground">
                  Live video feed from control signals.
                </p>
              </div>
              <Button
                onClick={() => setExpandedCard(null)}
                size="sm"
                variant="outline"
              >
                <X className="h-4 w-4 mr-2" />
                Back to Grid
              </Button>
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
              <div className="lg:col-span-2 animate-in slide-in-from-left-6 duration-500 delay-150">
                <Card className="h-full bg-gradient-card border-border/50 backdrop-blur-glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-medium">Live Camera Feed</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Control Signals
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4" style={{ height: 'calc(100% - 80px)' }}>
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      {videos.length > 0 ? (
                        <VideoPlayer videos={videos} initialTime={videoTimeRef.current} onTimeUpdate={(time) => { videoTimeRef.current = time; }} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white/30">
                          <p>No video feed</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1 animate-in slide-in-from-right-6 duration-500 delay-300">
                <Card className="h-full bg-gradient-card border-border/50 backdrop-blur-glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Traffic Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {/* Synced Traffic Analysis */}
                    {selectedRegion && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Traffic Level:</span>
                            <span className={`text-sm font-medium ${getTrafficColor(selectedRegion?.trafficLevel || '')}`}>
                              {selectedRegion?.trafficLevel}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Vehicle Count:</span>
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{selectedRegion?.vehicleCount}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Traffic Nodes:</span>
                            <span className="text-sm font-medium">{trafficNodes.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Updated:</span>
                            <span className="text-sm font-medium">{selectedRegion?.lastUpdate}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Red Alerts:</span>
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3 text-red-500" />
                                <span className="font-medium">{trafficNodes.filter(n => n.severity === 'red').length}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Yellow Alerts:</span>
                              <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3 text-yellow-500" />
                                <span className="font-medium">{trafficNodes.filter(n => n.severity === 'yellow').length}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            <p>Coordinates: {selectedRegion?.lat.toFixed(6)}, {selectedRegion?.lng.toFixed(6)}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-screen flex bg-background overflow-hidden animate-in fade-in-0 slide-in-from-right-4 duration-300">
        <Sidebar />
        
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Selected Region - Expanded View</h1>
              <p className="text-muted-foreground">
                Detailed analysis of 1km radius around {selectedRegion?.address}
              </p>
            </div>
            <Button
              onClick={() => setExpandedCard(null)}
              size="sm"
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Back to Grid
            </Button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            <div className="lg:col-span-2 animate-in slide-in-from-left-6 duration-500 delay-150">
              <Card className="h-full bg-gradient-card border-border/50 backdrop-blur-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium">Selected Region Map</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      1km Radius
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {selectedRegion?.address}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 pb-4" style={{ height: 'calc(100% - 80px)' }}>
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <div ref={expandedMapRef} className="w-full h-full" style={{ minHeight: '500px' }} />
                    
                    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1">
                      <Button
                        onClick={handleExpandedZoomIn}
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleExpandedZoomOut}
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      onClick={handleExpandedRefresh}
                      size="sm"
                      className="absolute top-4 left-4 z-[1000] h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
                      title="Refresh traffic data"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() => setIsMaximized(true)}
                      size="sm"
                      variant="secondary"
                      className="absolute bottom-4 right-4 z-[1000] h-8 w-8"
                      title="Maximize view"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 animate-in slide-in-from-right-6 duration-500 delay-300">
              <Card className="h-full bg-gradient-card border-border/50 backdrop-blur-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Traffic Analytics</CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Traffic Level:</span>
                      <span className={`text-sm font-medium ${getTrafficColor(selectedRegion?.trafficLevel || '')}`}>
                        {selectedRegion?.trafficLevel}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vehicle Count:</span>
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{selectedRegion?.vehicleCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Traffic Nodes:</span>
                      <span className="text-sm font-medium">{trafficNodes.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated:</span>
                      <span className="text-sm font-medium">{selectedRegion?.lastUpdate}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Red Alerts:</span>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-red-500" />
                          <span className="font-medium">1</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Yellow Alerts:</span>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-yellow-500" />
                          <span className="font-medium">1</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      <p>Coordinates: {selectedRegion?.lat.toFixed(6)}, {selectedRegion?.lng.toFixed(6)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if ((expandedCard === 'selectedRegion' && selectedRegion) || expandedCard === 'camera3') {
    return <ExpandedView />;
  }

  if (isMaximized && selectedRegion) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div>
            <h1 className="text-xl font-bold text-foreground">Selected Region - Maximized View</h1>
            <p className="text-sm text-muted-foreground">{selectedRegion.address}</p>
          </div>
          <Button
            onClick={() => setIsMaximized(false)}
            size="sm"
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>

        <div className="relative w-full h-[calc(100vh-80px)]">
          <div ref={mapRef} className="w-full h-full" />
          
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

          <Button
            onClick={handleRefresh}
            size="sm"
            className="absolute top-4 left-4 z-[1000] h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
            title="Refresh traffic data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-4 z-[1000]">
            <Card className="bg-gradient-card/95 border-border/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Traffic Level:</span>
                    <span className={`ml-2 font-medium ${getTrafficColor(selectedRegion.trafficLevel)}`}>
                      {selectedRegion.trafficLevel}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicles:</span>
                    <span className="ml-2 font-medium">{selectedRegion.vehicleCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Red Alerts:</span>
                    <span className="ml-2 font-medium text-red-500">
                      {trafficNodes.filter(n => n.severity === 'red').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yellow Alerts:</span>
                    <span className="ml-2 font-medium text-yellow-500">
                      {trafficNodes.filter(n => n.severity === 'yellow').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Selected Region</h1>
            <p className="text-muted-foreground">
              {selectedRegion ? `Monitoring 1km radius around selected location` : 'Double-click on the main map to select a region'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRegion && (
              <Badge variant="secondary" className="text-xs">
                <Activity className="h-3 w-3 mr-1" />
                1 Region Active
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
          {selectedRegion ? (
            <Card className="bg-gradient-card border-border/50 backdrop-blur-glass aspect-square flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">Selected Region</span>
                  </div>
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    1km
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{selectedRegion.address.split(',')[0]}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-3 flex-1 flex flex-col">
                <div className="relative flex-1 bg-black rounded-md mb-3 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900">
                    <div ref={mapRef} className="w-full h-full" />
                  </div>
                  
                  <div className="absolute inset-0 pointer-events-none z-20">
                    <div className="absolute bottom-3 left-3 pointer-events-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 w-9 p-0 bg-black/80 hover:bg-black/90 text-white shadow-xl border-2 border-white/30 backdrop-blur-sm"
                        onClick={handleRefresh}
                        title="Refresh traffic data"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 right-3 pointer-events-auto">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-9 w-9 p-0 bg-black/80 hover:bg-black/90 text-white shadow-xl border-2 border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
                        onClick={() => setExpandedCard('selectedRegion')}
                        title="Expand card"
                      >
                        <Expand className="h-4 w-4 transition-transform duration-200" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={`h-3 w-3 ${getTrafficColor(selectedRegion.trafficLevel)}`} />
                      <span className={getTrafficColor(selectedRegion.trafficLevel)}>{selectedRegion.trafficLevel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground">{selectedRegion.vehicleCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated: {selectedRegion.lastUpdate}</span>
                    <Badge variant="default" className="text-xs px-2 py-1">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-card border-border/50 backdrop-blur-glass opacity-50 aspect-square flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span className="font-medium">No Region</span>
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    Inactive
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Select region</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-3 flex-1 flex flex-col">
                <div className="relative flex-1 bg-gray-900 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                  <div className="text-center text-white/30">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No Region</p>
                  </div>
                </div>

                <div className="space-y-1 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-500">-</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground">0</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Double-click map</span>
                    <Badge variant="secondary" className="text-xs px-2 py-1">
                      Inactive
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera 2 - Offline */}
          <Card className="bg-gradient-card border-border/50 backdrop-blur-glass opacity-30 aspect-square flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                  <span className="font-medium">Camera 2</span>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Offline
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Not available</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3 flex-1 flex flex-col">
              <div className="relative flex-1 bg-gray-800 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                <div className="text-center text-white/20">
                  <div className="h-8 w-8 mx-auto mb-2 bg-gray-600 rounded" />
                  <p className="text-sm">Offline</p>
                </div>
              </div>
              <div className="space-y-1 flex-shrink-0">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Status: Offline</span>
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    N/A
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera 3 - Live Video Feed */}
          <Card className="bg-gradient-card border-border/50 backdrop-blur-glass aspect-square flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-medium">Camera 3</span>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-1">
                  Live
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Control Signal Feed</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3 flex-1 flex flex-col">
              <div className="relative flex-1 bg-black rounded-md mb-3 overflow-hidden">
                {videos.length > 0 ? (
                  <VideoPlayer videos={videos} initialTime={videoTimeRef.current} onTimeUpdate={(time) => { videoTimeRef.current = time; }} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white/30">
                    <p>No video feed</p>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none z-20">
                  <div className="absolute bottom-3 right-3 pointer-events-auto">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-9 w-9 p-0 bg-black/80 hover:bg-black/90 text-white shadow-xl border-2 border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
                      onClick={() => setExpandedCard('camera3')}
                      title="Expand card"
                    >
                      <Expand className="h-4 w-4 transition-transform duration-200" />
                    </Button>
                  </div>
                </div>
              </div>
              {selectedRegion && (
                <div className="space-y-1 flex-shrink-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={`h-3 w-3 ${getTrafficColor(selectedRegion.trafficLevel)}`} />
                      <span className={getTrafficColor(selectedRegion.trafficLevel)}>{selectedRegion.trafficLevel}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground">{selectedRegion.vehicleCount}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Updated: {selectedRegion.lastUpdate}</span>
                    <Badge variant="default" className="text-xs px-2 py-1">
                      Active
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Camera;
