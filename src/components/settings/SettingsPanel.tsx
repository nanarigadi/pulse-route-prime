import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type HealthStatus = "ok" | "warning" | "critical";

function statusToBadge(status: HealthStatus) {
  if (status === "ok") return <Badge className="bg-green-600/90 text-green-50">🟢 OK</Badge>;
  if (status === "warning") return <Badge className="bg-yellow-500/90 text-black">🟡 Warning</Badge>;
  return <Badge className="bg-red-600/90 text-red-50">🔴 Critical</Badge>;
}

// Theme switching has been removed; dashboard is always dark mode.

export default function SettingsPanel() {
  const { toast } = useToast();

  // Mock system metrics
  const [cpu, setCpu] = useState(42);
  const [memory, setMemory] = useState(63);
  const [dbStatus, setDbStatus] = useState<HealthStatus>("ok");
  const [deviceStatus, setDeviceStatus] = useState<HealthStatus>("warning");
  const [lastDeviceChangeAt, setLastDeviceChangeAt] = useState<number>(Date.now());


  // Smoothly animate mock metrics periodically
  useEffect(() => {
    const id = setInterval(() => {
      setCpu((v) => Math.max(5, Math.min(98, v + (Math.random() * 10 - 5))));
      setMemory((v) => Math.max(5, Math.min(98, v + (Math.random() * 8 - 4))));
      // Randomly nudge statuses
      const roll = Math.random();
      setDbStatus(roll > 0.95 ? "critical" : roll > 0.85 ? "warning" : "ok");
      const roll2 = Math.random();
      const proposedDevice = roll2 > 0.9 ? "critical" : roll2 > 0.75 ? "warning" : "ok";
      const now = Date.now();
      // Stabilize Device Health: only allow status change at most every 20s
      if (proposedDevice !== deviceStatus && now - lastDeviceChangeAt > 20000) {
        setDeviceStatus(proposedDevice);
        setLastDeviceChangeAt(now);
      }
    }, 2500);
    return () => clearInterval(id);
  }, [deviceStatus, lastDeviceChangeAt]);

  // No theme switching logic; persist dark mode by default.

  const users = useMemo(
    () => [
      { name: "Aarav Mehta", email: "aarav.mehta@gatiflow.ai", role: "Admin" },
      { name: "Isha Verma", email: "isha.verma@gatiflow.ai", role: "Operator" },
      { name: "Rohan Gupta", email: "rohan.gupta@gatiflow.ai", role: "Analyst" },
    ],
    []
  );

  const devices = useMemo(
    () => [
      { id: "CAM-102", type: "Camera", status: "Online" },
      { id: "SEN-221", type: "AQ Sensor", status: "Degraded" },
      { id: "SIG-334", type: "Signal Controller", status: "Offline" },
      { id: "LPR-418", type: "LPR", status: "Online" },
    ],
    []
  );

  function handleClearCache() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      toast({ title: "Cache cleared", description: "Local and session storage have been cleared." });
    } catch (e) {
      toast({ title: "Failed to clear cache", description: "Your browser blocked the operation.", variant: "destructive" });
    }
  }

  function handleReloadLiveData() {
    // Broadcast a soft refresh event other parts of the dashboard can listen to.
    const evt = new CustomEvent("gati:reload-live-data");
    window.dispatchEvent(evt);
    toast({ title: "Live data reload triggered", description: "Active widgets will refresh shortly." });
  }

  return (
    <div className="p-4 space-y-6">
      {/* Top row: System Health, Data Archiving, Help & Troubleshooting */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">CPU Usage</span>
                {statusToBadge(cpu < 75 ? "ok" : cpu < 90 ? "warning" : "critical")}
              </div>
              <Progress value={cpu} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Memory Usage</span>
                {statusToBadge(memory < 75 ? "ok" : memory < 90 ? "warning" : "critical")}
              </div>
              <Progress value={memory} className="h-2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Database</div>
              {statusToBadge(dbStatus)}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Device Health</div>
              {statusToBadge(deviceStatus)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle>Data Archiving Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Archive traffic data after 6 months. High-volume sensor data is downsampled after 30 days.
              Critical incident logs retained for 2 years per policy.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border border-border/50 xl:col-span-1">
          <CardHeader>
            <CardTitle>Help & Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClearCache}>Clear Cache</Button>
              <Button onClick={handleReloadLiveData}>Reload Live Data</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use these tools if widgets appear out-of-sync or stale.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Second row: Role-based User Management and Device Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle>Role-based User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.email}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary/60">
                        {u.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border/50">
          <CardHeader>
            <CardTitle>Device Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.id}</TableCell>
                    <TableCell>{d.type}</TableCell>
                    <TableCell>
                      {d.status === "Online" && <Badge className="bg-green-600/90 text-green-50">Online</Badge>}
                      {d.status === "Degraded" && <Badge className="bg-yellow-500/90 text-black">Degraded</Badge>}
                      {d.status === "Offline" && <Badge className="bg-red-600/90 text-red-50">Offline</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Account Preferences removed per requirement: no theme toggle */}
    </div>
  );
}


