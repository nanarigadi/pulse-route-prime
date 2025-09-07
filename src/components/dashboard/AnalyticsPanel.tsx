import { TrendingUp, TrendingDown, Leaf, Zap, Cloud, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const analyticsData = [
  {
    title: "Traffic Trends",
    value: "+15%",
    subtitle: "vs last week",
    icon: TrendingUp,
    trend: "up",
    color: "success"
  },
  {
    title: "CO₂ Emission Savings",
    value: "-8%",
    subtitle: "this month",
    icon: Leaf,
    trend: "down",
    color: "success"
  },
  {
    title: "Signal Efficiency",
    value: "92%",
    subtitle: "+5%",
    icon: Zap,
    trend: "up",
    color: "info"
  },
  {
    title: "Weather Impact",
    value: "Moderate",
    subtitle: "-3% flow",
    icon: Cloud,
    trend: "down",
    color: "warning"
  }
];

export function AnalyticsPanel() {
  return (
    <div className="w-72 p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
        <Badge variant="secondary" className="text-xs">
          Real-time
        </Badge>
      </div>

      {/* Equal-height cards filling available space */}
      <div className="grid grid-rows-4 gap-3 flex-1">
        {analyticsData.map((item, index) => {
          const Icon = item.icon;

          return (
            <Card
              key={index}
              className="bg-gradient-card border border-border/50 backdrop-blur-glass flex flex-col"
            >
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center justify-between text-[13px] font-medium">
                  <span className="text-muted-foreground">{item.title}</span>
                  <Icon
                    className={`h-4 w-4 ${
                      item.color === "success"
                        ? "text-success"
                        : item.color === "warning"
                        ? "text-warning"
                        : item.color === "info"
                        ? "text-info"
                        : "text-muted-foreground"
                    }`}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3 flex-1 flex flex-col justify-end">
                <div className="flex items-end justify-between">
                  <div>
                    <div
                      className={`text-xl font-bold ${
                        item.color === "success"
                          ? "text-success"
                          : item.color === "warning"
                          ? "text-warning"
                          : item.color === "info"
                          ? "text-info"
                          : "text-foreground"
                      }`}
                    >
                      {item.value}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {item.subtitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.trend === "up" && (
                      <TrendingUp className="h-3 w-3 text-success" />
                    )}
                    {item.trend === "down" && (
                      <TrendingDown
                        className={`h-3 w-3 ${
                          item.title.includes("CO₂")
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      />
                    )}
                    <span
                      className={`text-[11px] ${
                        item.trend === "up"
                          ? "text-success"
                          : item.trend === "down" &&
                            item.title.includes("CO₂")
                          ? "text-success"
                          : item.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.trend === "stable" ? "—" : item.subtitle}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
