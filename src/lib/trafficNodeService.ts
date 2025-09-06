import L from 'leaflet';

export interface TrafficNode {
  lat: number;
  lng: number;
  severity: 'red' | 'yellow';
  radius: number;
  id: string;
}

export interface RoadGeometry {
  latlngs: [number, number][];
  lengthMeters: number;
}

class TrafficNodeService {
  private static instance: TrafficNodeService;
  private currentNodes: TrafficNode[] = [];
  private roadGeometries: RoadGeometry[] = [];
  private listeners: Array<(nodes: TrafficNode[]) => void> = [];
  private refreshInterval: NodeJS.Timeout | null = null;
  
  get isAutoRefreshActive(): boolean {
    return this.refreshInterval !== null;
  }

  static getInstance(): TrafficNodeService {
    if (!TrafficNodeService.instance) {
      TrafficNodeService.instance = new TrafficNodeService();
    }
    return TrafficNodeService.instance;
  }

  // Subscribe to node updates
  subscribe(callback: (nodes: TrafficNode[]) => void): () => void {
    this.listeners.push(callback);
    // Immediately call with current nodes
    callback(this.currentNodes);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all subscribers
  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentNodes));
  }

  // Set road geometries for node generation
  setRoadGeometries(geometries: RoadGeometry[]) {
    this.roadGeometries = geometries;
  }

  // Generate traffic nodes using the same logic as TrafficMap
  generateNodes(bounds?: L.LatLngBounds, targetCount?: number) {
    if (this.roadGeometries.length === 0) {
      this.currentNodes = [];
      this.notifyListeners();
      return;
    }

    const nodeCount = targetCount || Math.min(150, Math.max(50, 100));
    const minGapMeters = 15;
    const placements: { latlng: L.LatLng; radius: number }[] = [];
    const newNodes: TrafficNode[] = [];

    const maxAttempts = nodeCount * 50;
    let placed = 0;
    let attempts = 0;

    while (placed < nodeCount && attempts < maxAttempts) {
      attempts++;
      const severityType = this.randomSeverity();
      const color = this.colorFor(severityType);
      const areaRadius = this.radiusFor(severityType);

      const way = this.chooseWeightedWay();
      if (!way) continue;

      const p = this.randomPointOnWay(way.latlngs);
      const pLL = L.latLng(p[0], p[1]);

      // Check if point is within bounds (if provided)
      if (bounds && !bounds.contains(pLL)) continue;

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

      newNodes.push({
        id: `node_${Date.now()}_${placed}`,
        lat: p[0],
        lng: p[1],
        severity: severityType,
        radius: areaRadius
      });

      placed++;
    }

    this.currentNodes = newNodes;
    this.notifyListeners();
  }

  // Get current nodes
  getCurrentNodes(): TrafficNode[] {
    return [...this.currentNodes];
  }

  // Get nodes within a specific area
  getNodesInBounds(bounds: L.LatLngBounds): TrafficNode[] {
    return this.currentNodes.filter(node => 
      bounds.contains(L.latLng(node.lat, node.lng))
    );
  }

  // Get nodes within radius of a point
  getNodesInRadius(center: L.LatLng, radiusMeters: number): TrafficNode[] {
    return this.currentNodes.filter(node => {
      const nodeLatLng = L.latLng(node.lat, node.lng);
      return center.distanceTo(nodeLatLng) <= radiusMeters;
    });
  }

  // Start auto-refresh (2 minutes)
  startAutoRefresh() {
    if (this.refreshInterval) return;
    
    this.refreshInterval = setInterval(() => {
      this.generateNodes();
    }, 120000); // 2 minutes
  }

  // Stop auto-refresh
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Manual refresh
  refresh() {
    this.generateNodes();
  }

  // Helper methods (same as TrafficMap)
  private randomSeverity(): 'red' | 'yellow' {
    return Math.random() < 0.4 ? 'red' : 'yellow';
  }

  private colorFor(severity: 'red' | 'yellow'): string {
    return severity === 'red' ? '#ef4444' : '#f59e0b';
  }

  private radiusFor(severity: 'red' | 'yellow'): number {
    return severity === 'red' ? 120 : 100;
  }

  private chooseWeightedWay(minLengthMeters = 200): RoadGeometry | null {
    const candidates = this.roadGeometries.filter(w => w.lengthMeters >= minLengthMeters);
    const pool = candidates.length > 5 ? candidates : this.roadGeometries;
    if (pool.length === 0) return null;
    
    const total = pool.reduce((sum, w) => sum + Math.max(1, w.lengthMeters), 0);
    let r = Math.random() * total;
    
    for (const way of pool) {
      r -= Math.max(1, way.lengthMeters);
      if (r <= 0) return way;
    }
    
    return pool[pool.length - 1];
  }

  private randomPointOnWay(latlngs: [number, number][]): [number, number] {
    if (latlngs.length < 2) return latlngs[0];
    
    const segmentIndex = Math.floor(Math.random() * (latlngs.length - 1));
    const t = Math.random();
    const p1 = latlngs[segmentIndex];
    const p2 = latlngs[segmentIndex + 1];
    
    return [
      p1[0] + t * (p2[0] - p1[0]),
      p1[1] + t * (p2[1] - p1[1])
    ];
  }
}

export default TrafficNodeService;
