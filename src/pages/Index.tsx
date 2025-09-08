import React, { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MapSection } from "@/components/dashboard/MapSection";
import { AnalyticsPanel } from "@/components/dashboard/AnalyticsPanel";
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

function useRealisticLiveSeries(
  initial: number,
  min: number,
  max: number,
  maxStepSize: number = 0.1, // Maximum change per step
  length = 40
) {
  const [series, setSeries] = useState<LivePoint[]>(() =>
    Array.from({ length }, (_, i) => ({ t: i, v: initial }))
  );
  const valueRef = useRef<number>(initial);
  const trendRef = useRef<number>(0); // Current trend direction (-1, 0, 1)
  const stabilityRef = useRef<number>(0); // Stability counter

  useEffect(() => {
    const id = setInterval(() => {
      const currentValue = valueRef.current;
      
      // Determine trend direction (tendency to go up or down)
      // Change trend occasionally but not too frequently
      if (Math.random() < 0.1) { // 10% chance to change trend
        trendRef.current = Math.random() < 0.5 ? -1 : 1;
        stabilityRef.current = 0;
      }
      
      // Add some stability - sometimes stay flat
      if (Math.random() < 0.3) { // 30% chance to stay flat
        trendRef.current = 0;
      }
      
      // Calculate step size (smaller steps for more realistic movement)
      const baseStep = maxStepSize * (0.5 + Math.random() * 0.5); // 50-100% of max step
      const step = baseStep * trendRef.current;
      
      let nextValue = currentValue + step;
      
      // Smooth boundary handling - slow down as we approach limits
      const distanceFromMin = nextValue - min;
      const distanceFromMax = max - nextValue;
      
      if (distanceFromMin < 0.2) {
        // Near minimum - gently push up
        nextValue = min + 0.1 + Math.random() * 0.1;
        trendRef.current = 1;
      } else if (distanceFromMax < 0.2) {
        // Near maximum - gently push down
        nextValue = max - 0.1 - Math.random() * 0.1;
        trendRef.current = -1;
      }
      
      // Ensure we stay within bounds
      nextValue = Math.max(min, Math.min(max, nextValue));
      valueRef.current = nextValue;

      setSeries((prev) => {
        const shifted = prev.slice(1).map((p) => ({ t: p.t - 1, v: p.v }));
        return [
          ...shifted,
          { t: prev[prev.length - 1].t + 1, v: Number(nextValue.toFixed(2)) },
        ];
      });
    }, 1000);
    return () => clearInterval(id);
  }, [min, max, maxStepSize]);

  return series;
}

const Index = () => {
  // Realistic ranges and smooth step sizes
  const commuteReductionSeries = useRealisticLiveSeries(4.5, 3.0, 6.0, 0.05); // Small steps
  const co2ReductionSeries = useRealisticLiveSeries(100, 80, 120, 0.8); // Moderate steps for larger range
  const fuelConsumptionSeries = useRealisticLiveSeries(4.7, 4.0, 5.5, 0.03); // Small steps

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Row: Map and Analytics Panel - 2/3 height */}
        <div className="flex-[2] flex overflow-hidden">
          {/* Map Section - Takes up most of the left space */}
          <div className="flex-[3] p-4">
            <div className="h-full bg-gradient-card border border-border/50 rounded-lg overflow-hidden">
              <MapSection />
            </div>
          </div>
          
          {/* Analytics Panel - Keep exactly as is */}
          <div className="flex-[1] w-80">
            <AnalyticsPanel />
          </div>
        </div>
        
        {/* Bottom Row: Three live trend graphs - 1/3 height */}
        <div className="flex-[1] p-4 pt-0">
          <div className="grid grid-cols-3 gap-4 h-full">
            {/* Commute Time Reduction (%) - Ticks every 1% */}
            <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">Commute Time Reduction (%)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3 h-[calc(100%-2rem)]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={commuteReductionSeries}
                    margin={{ top: 5, right: 5, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="t" hide />
                    <YAxis
                      domain={[3, 6]}
                      unit="%"
                      width={25}
                      tick={{ fontSize: 8 }}
                      stroke="currentColor"
                      className="fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      ticks={[3, 4, 5, 6]}
                      tickFormatter={(value) => `${value}%`}
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

            {/* CO2 Emission Reduction (tons) - Ticks every 10 units */}
            <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">CO₂ Emission Reduction (tons)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3 h-[calc(100%-2rem)]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={co2ReductionSeries}
                    margin={{ top: 5, right: 5, left: 35, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="t" hide />
                    <YAxis
                      domain={[80, 120]}
                      unit=" t"
                      width={30}
                      tick={{ fontSize: 8 }}
                      stroke="currentColor"
                      className="fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      ticks={[80, 90, 100, 110, 120]}
                      tickFormatter={(value) => `${value}t`}
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

            {/* Fuel Consumption (kL) - Ticks every 0.5 units */}
            <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass">
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">Fuel Consumption (kL)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3 h-[calc(100%-2rem)]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={fuelConsumptionSeries}
                    margin={{ top: 5, right: 5, left: 30, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="t" hide />
                    <YAxis
                      domain={[4, 5.5]}
                      unit=" kL"
                      width={25}
                      tick={{ fontSize: 8 }}
                      stroke="currentColor"
                      className="fill-muted-foreground"
                      axisLine={false}
                      tickLine={false}
                      ticks={[4.0, 4.5, 5.0, 5.5]}
                      tickFormatter={(value) => `${value}kL`}
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
      </div>
    </div>
  );
};

export default Index;
