import React, { useEffect, useRef, useState } from "react";
import { TrafficMap } from "./TrafficMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

type LivePoint = { t: number; v: number };

function useLiveSeries(
  initial: number,
  min: number,
  max: number,
  step: number,
  length = 40
) {
  const [series, setSeries] = useState<LivePoint[]>(() =>
    Array.from({ length }, (_, i) => ({ t: i, v: initial }))
  );
  const valueRef = useRef<number>(initial);

  useEffect(() => {
    const id = setInterval(() => {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const delta = Math.random() * step * dir;
      let next = valueRef.current + delta;
      if (next < min) next = min + Math.random() * step;
      if (next > max) next = max - Math.random() * step;
      valueRef.current = next;

      setSeries((prev) => {
        const shifted = prev.slice(1).map((p) => ({ t: p.t - 1, v: p.v }));
        return [
          ...shifted,
          { t: prev[prev.length - 1].t + 1, v: Number(next.toFixed(2)) },
        ];
      });
    }, 1000);
    return () => clearInterval(id);
  }, [min, max, step]);

  return series;
}

export function MapSection() {
  const commuteSeries = useLiveSeries(4.5, 3.0, 6.0, 0.2);
  const co2Series = useLiveSeries(112.5, 110.0, 115.0, 0.4);
  const fuelSeries = useLiveSeries(4.2, 3.0, 5.0, 0.15);

  return (
    <div className="flex-1 relative h-full flex flex-col gap-2">
      {/* Top 2/3: Live Map */}
      <div className="flex-[2] relative">
        <div className="absolute inset-0 bg-gradient-card border border-border/50 rounded-lg overflow-hidden">
          <TrafficMap />
        </div>
      </div>

      {/* Bottom 1/3: Three live graphs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-1 flex-[1]">
        <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">Commute Time Reduction (%)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2 h-[calc(100%-2rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={commuteSeries}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[3, 6]}
                  unit="%"
                  width={28}
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  className="fill-muted-foreground"
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={400}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">CO₂ Emission Reduction (tons)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2 h-[calc(100%-2rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={co2Series}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[110, 115]}
                  unit=" t"
                  width={32}
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  className="fill-muted-foreground"
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--success))"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={400}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs">Fuel Consumption (kL)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-2 pb-2 h-[calc(100%-2rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={fuelSeries}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="t" hide />
                <YAxis
                  domain={[3, 5]}
                  unit=" kL"
                  width={30}
                  tick={{ fontSize: 10 }}
                  stroke="currentColor"
                  className="fill-muted-foreground"
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive
                  animationDuration={400}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
