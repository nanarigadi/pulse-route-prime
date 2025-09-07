import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Get current date formatted as "Thursday, 4 September 2025"
const getCurrentDate = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return now.toLocaleDateString('en-US', options);
};

// Event data for Bhubaneswar - Major traffic-diverting events only (max 4)
const eventsData = [
  {
    id: 1,
    name: "Rath Yatra, Puri",
    location: "Puri Temple Complex",
    severity: "SEVERE",
    trafficIncrease: 85,
    delayRange: "45-90 minutes",
    time: "6:00 AM - 8:00 PM",
    icon: "🎉",
    type: "festival"
  },
  {
    id: 2,
    name: "Barabati Stadium Match",
    location: "Cuttack (Near Bhubaneswar)",
    severity: "SEVERE",
    trafficIncrease: 90,
    delayRange: "60-120 minutes",
    time: "7:00 PM - 11:00 PM",
    icon: "🏏",
    type: "sports"
  },
  {
    id: 3,
    name: "Monsoon Traffic Disruption",
    location: "Jayadev Vihar Junction",
    severity: "HIGH",
    trafficIncrease: 70,
    delayRange: "30-60 minutes",
    time: "All Day",
    icon: "🌧",
    type: "weather"
  },
  {
    id: 4,
    name: "IT Hub Construction",
    location: "Infocity, Chandrasekharpur",
    severity: "MEDIUM",
    trafficIncrease: 40,
    delayRange: "15-30 minutes",
    time: "9:00 AM - 5:00 PM",
    icon: "🚧",
    type: "construction"
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "SEVERE":
      return "bg-red-500 text-white";
    case "HIGH":
      return "bg-orange-500 text-white";
    case "MEDIUM":
      return "bg-yellow-500 text-black";
    case "LOW":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const EventCard = ({ event }: { event: typeof eventsData[0] }) => {
  return (
    <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass shadow-lg hover:shadow-xl transition-all duration-300 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">{event.icon}</span>
            <div>
              <CardTitle className="text-lg font-semibold">{event.name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <span>📍</span>
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          <Badge className={getSeverityColor(event.severity)}>
            {event.severity}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-medium text-blue-600">{event.time}</span>
        </div>

        {/* Traffic Increase Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Traffic Increase</span>
            <span className="font-medium">{event.trafficIncrease}%</span>
          </div>
          <Progress 
            value={event.trafficIncrease} 
            className="h-2"
            style={{
              background: `linear-gradient(90deg, 
                ${event.trafficIncrease > 70 ? '#ef4444' : 
                  event.trafficIncrease > 50 ? '#f97316' : 
                  event.trafficIncrease > 30 ? '#eab308' : '#22c55e'} 
                ${event.trafficIncrease}%, #e5e7eb ${event.trafficIncrease}%)`
            }}
          />
        </div>

        {/* Delay Range */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Expected Delay:</span>
          <span className="font-medium text-orange-600">{event.delayRange}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyEventCard = () => {
  return (
    <Card className="bg-gradient-card border border-border/50 backdrop-blur-glass shadow-lg h-full flex items-center justify-center">
      <CardContent className="text-center">
        <div className="text-4xl mb-2 opacity-50">📅</div>
        <p className="text-muted-foreground font-medium">No event to show</p>
      </CardContent>
    </Card>
  );
};

const Events = () => {
  // Ensure we only show maximum 4 events
  const displayEvents = eventsData.slice(0, 4);
  const emptySlots = 4 - displayEvents.length;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <h1 className="text-2xl font-bold">Event Horizon - Bhubaneswar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Major traffic-diverting events for today (updates every 24 hours)
          </p>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-foreground">{getCurrentDate()}</h2>
          </div>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Display actual events */}
              {displayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              
              {/* Display empty placeholder cards */}
              {Array.from({ length: emptySlots }).map((_, index) => (
                <EmptyEventCard key={`empty-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;