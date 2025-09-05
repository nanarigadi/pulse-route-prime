import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

// Generate a 30-day fake dataset comparing systems city-wide
const days = Array.from({ length: 30 }, (_, i) => i + 1);
const monthlyData = days.map((d) => {
  // Baselines and effects fluctuate mildly over the month
  const withoutCommuteReductionPct = 2 + Math.sin(d / 3) * 1.5; // 0-4%
  const withCommuteReductionPct = 8 + Math.sin((d + 2) / 3) * 2; // 6-10%

  const fuelWithoutKL = 52 + Math.cos(d / 4) * 3; // around 49-55 kL
  const fuelWithKL = fuelWithoutKL * 0.9 + (Math.sin(d / 5) * 0.5); // ~10% less on avg

  const co2WithoutTons = 130 + Math.sin(d / 6) * 6; // around 124-136 tons
  const co2WithTons = co2WithoutTons * 0.9 + (Math.cos(d / 5) * 1.2); // ~10% less on avg

  return {
    day: d,
    commuteReductionWith: Number(withCommuteReductionPct.toFixed(1)),
    commuteReductionWithout: Number(withoutCommuteReductionPct.toFixed(1)),
    fuelWith: Number(fuelWithKL.toFixed(1)),
    fuelWithout: Number(fuelWithoutKL.toFixed(1)),
    // For waterfall: baseline (without) and delta = with - without
    fuelBaseline: Number(fuelWithoutKL.toFixed(1)),
    fuelDelta: Number((fuelWithKL - fuelWithoutKL).toFixed(1)),
    co2With: Number(co2WithTons.toFixed(1)),
    co2Without: Number(co2WithoutTons.toFixed(1))
  };
});

// Weather impact buckets (avg commute time reduction %)
const weatherImpact = [
  { label: "Low", withWebsite: 10.2, withoutWebsite: 3.1 },
  { label: "Moderate", withWebsite: 8.4, withoutWebsite: 2.6 },
  { label: "High", withWebsite: 6.1, withoutWebsite: 1.9 }
];

const chartGridClass = "bg-gradient-card border border-border/50 backdrop-blur-glass";

// Static city zone impact data for table

const zoneMetrics = [
  { zone: "Downtown Core", commuteReductionPct: 11.2, fuelSavedKL: 6.3, co2SavedTons: 14.1, weatherEfficiencyPct: 9.8 },
  { zone: "North District", commuteReductionPct: 8.1, fuelSavedKL: 4.2, co2SavedTons: 9.6, weatherEfficiencyPct: 7.4 },
  { zone: "East Industrial", commuteReductionPct: 5.3, fuelSavedKL: 2.8, co2SavedTons: 6.1, weatherEfficiencyPct: 4.3 },
  { zone: "University Belt", commuteReductionPct: 10.5, fuelSavedKL: 5.7, co2SavedTons: 12.9, weatherEfficiencyPct: 8.7 },
  { zone: "West Suburbs", commuteReductionPct: 7.6, fuelSavedKL: 3.9, co2SavedTons: 8.4, weatherEfficiencyPct: 6.8 },
  { zone: "South Waterfront", commuteReductionPct: 9.9, fuelSavedKL: 5.1, co2SavedTons: 11.7, weatherEfficiencyPct: 8.2 }
];

// Compact tooltip component and shared styles
const tooltipBoxStyle: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: 8,
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  padding: 6,
};

const tooltipLabelStyle: React.CSSProperties = { fontSize: 11, marginBottom: 2 };
const tooltipItemStyle: React.CSSProperties = { fontSize: 11, margin: 0, padding: 0 };

function CompactTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string | number }) {
  if (!active || !payload || payload.length === 0) return null;
  const safePayload = payload.filter((p) => p && p.value !== null && p.value !== undefined);
  if (safePayload.length === 0) return null;

  return (
    <div style={tooltipBoxStyle} className="backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm">
      {label !== undefined && (
        <div style={tooltipLabelStyle} className="text-foreground">
          {typeof label === "number" ? `Day ${label}` : label}
        </div>
      )}
      <div className="space-y-0.5">
        {safePayload.map((entry, idx) => (
          <div key={idx} style={tooltipItemStyle} className="flex items-center gap-2 text-foreground">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="opacity-80">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
            {entry.unit ? <span className="opacity-60">{entry.unit}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

const Analytics = () => {
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-4 space-y-6">
        <div>
          <h1 className="text-xl font-bold">City-wide Analytics</h1>
          <p className="text-xs text-muted-foreground">One-month comparison: AI-based system (With Website) vs Orthodox system (Without Website)</p>
        </div>

        {/* Charts in 2x2 matrix layout */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={chartGridClass}>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Commute Time Reduction (%) — With vs Without</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <YAxis unit="%" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <Tooltip content={<CompactTooltip />} isAnimationActive={false} trigger="hover" position={{ x: 0, y: 0 }} offset={30} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" name="With Nanarigadi" dataKey="commuteReductionWith" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" name="Without Nanarigadi" dataKey="commuteReductionWithout" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={chartGridClass}>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Fuel Consumption (kL) — Waterfall by Day</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} stackOffset="sign" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <YAxis unit=" kL" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <Tooltip content={<CompactTooltip />} isAnimationActive={false} trigger="hover" position={{ x: 0, y: 0 }} offset={30} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar name="Without Nanarigadi" dataKey="fuelBaseline" stackId="a" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} />
                    <Bar name="Delta (With - Without)" dataKey="fuelDelta" stackId="a" fill="hsl(var(--success))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={chartGridClass}>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">CO₂ Emissions (tons) — With vs Without</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <YAxis unit=" t" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <Tooltip content={<CompactTooltip />} isAnimationActive={false} trigger="hover" position={{ x: 0, y: 0 }} offset={30} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" name="With Nanarigadi" dataKey="co2With" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" name="Without Nanarigadi" dataKey="co2Without" stroke="hsl(var(--destructive))" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={chartGridClass}>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs">Weather Impact — Avg Commute Time Reduction (%)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weatherImpact} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <YAxis unit="%" stroke="currentColor" className="text-[10px] fill-muted-foreground" />
                    <Tooltip content={<CompactTooltip />} isAnimationActive={false} trigger="hover" position={{ x: 0, y: 0 }} offset={30} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar name="With Nanarigadi" dataKey="withWebsite" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                    <Bar name="Without Nanarigadi" dataKey="withoutWebsite" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zone-wise Comparison Table (with proper spacing) */}
        <Card className={chartGridClass}>
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">Zone-wise Impact Comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2 overflow-x-auto">
            <Table className="text-[11px] min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-1">Zone/Area</TableHead>
                  <TableHead className="text-right py-1">Commute Time Reduction (%)</TableHead>
                  <TableHead className="text-right py-1">Fuel Saved (kL)</TableHead>
                  <TableHead className="text-right py-1">CO₂ Emission Savings (tons)</TableHead>
                  <TableHead className="text-right py-1">Weather-adjusted Efficiency (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zoneMetrics.map((row) => (
                  <TableRow key={row.zone}>
                    <TableCell className="font-medium py-1">{row.zone}</TableCell>
                    <TableCell className="text-right py-1">{row.commuteReductionPct.toFixed(1)}%</TableCell>
                    <TableCell className="text-right py-1">{row.fuelSavedKL.toFixed(1)}</TableCell>
                    <TableCell className="text-right py-1">{row.co2SavedTons.toFixed(1)}</TableCell>
                    <TableCell className="text-right py-1">{row.weatherEfficiencyPct.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
