import { useEffect, useState } from 'react';
import { AlertTriangle, Cloud, Construction, Car, Zap, PartyPopper, Wrench, MapPin, Flame, Users, Building, ParkingCircle, ShieldAlert, Trophy } from 'lucide-react';

interface Notification {
  message: string;
  icon: React.ReactNode;
  id: string;
}

const notifications = [
  { message: "High traffic congestion reported on Janpath Road.", icon: <AlertTriangle className="h-5 w-5" />, id: "1" },
  { message: "Weather Alert: Heavy rainfall expected near KIIT Square.", icon: <Cloud className="h-5 w-5" />, id: "2" },
  { message: "Accident reported near Rasulgarh Square. Please use alternate routes.", icon: <Car className="h-5 w-5" />, id: "3" },
  { message: "Road closure on Cuttack-Puri Road for an event.", icon: <Construction className="h-5 w-5" />, id: "4" },
  { message: "Breakdown reported near Khandagiri. Expect delays.", icon: <Wrench className="h-5 w-5" />, id: "5" },
  { message: "Signal failure at Jaydev Vihar Square. Traffic personnel on duty.", icon: <Zap className="h-5 w-5" />, id: "6" },
  { message: "VIP movement near Secretariat. Temporary lane restrictions.", icon: <ShieldAlert className="h-5 w-5" />, id: "7" },
  { message: "Festival procession in Old Town. Diversions in place.", icon: <PartyPopper className="h-5 w-5" />, id: "8" },
  { message: "Road work on Nandankanan Road. Please drive slowly.", icon: <Users className="h-5 w-5" />, id: "9" },
  { message: "Fog advisory for early hours. Maintain safe distance.", icon: <Cloud className="h-5 w-5" />, id: "10" },
  { message: "Construction causing delays near Patia Square.", icon: <Building className="h-5 w-5" />, id: "11" },
  { message: "Parking full near railway station. Use alternate parking.", icon: <ParkingCircle className="h-5 w-5" />, id: "12" },
  { message: "Fuel spill cleared near Baramunda. Traffic normalizing.", icon: <Flame className="h-5 w-5" />, id: "13" },
  { message: "Marathon route active this morning. Several roads closed.", icon: <Trophy className="h-5 w-5" />, id: "14" }
];

export function TrafficNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show initial notification
    const initialTimeout = setTimeout(() => {
      showNotification("Simulated traffic analyser is now active!", <Zap className="h-5 w-5 text-success" />);
    }, 1500);

    // Set up recurring notifications
    const notificationInterval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      showNotification(randomNotification.message, randomNotification.icon);
    }, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(notificationInterval);
    };
  }, []);

  const showNotification = (message: string, icon: React.ReactNode) => {
    setCurrentNotification({ message, icon, id: Date.now().toString() });
    setIsVisible(true);

    // Hide notification after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  if (!currentNotification) return null;

  return (
    <div
      className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[2000] transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg px-4 py-3 shadow-lg max-w-md">
        <div className="text-primary">
          {currentNotification.icon}
        </div>
        <div className="text-sm text-foreground font-medium">
          {currentNotification.message}
        </div>
      </div>
    </div>
  );
}
