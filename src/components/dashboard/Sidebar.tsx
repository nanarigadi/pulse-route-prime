import { NavLink } from "react-router-dom";
import { 
  Map, 
  BarChart3, 
  AlertTriangle, 
  Cloud, 
  Calendar, 
  Camera, 
  Settings,
  Snowflake
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Live Map", href: "/", icon: Map, current: true },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Emergency", href: "/emergency", icon: AlertTriangle },
  { name: "Weather", href: "/weather", icon: Cloud },
  { name: "Event Horizon", href: "/events", icon: Calendar },
  { name: "Live Camera Feed", href: "/camera", icon: Camera },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-gradient-card border-r border-border/50 backdrop-blur-glass">
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
          <Snowflake className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">CityFlow</h1>
          <p className="text-xs text-muted-foreground">Smart Traffic Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              end
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-accent/10",
                  isActive
                    ? "bg-accent/20 text-accent border border-accent/30 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="h-5 w-5 transition-colors" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
