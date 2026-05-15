import {
  Wifi,
  Car,
  Coffee,
  UtensilsCrossed,
  Waves,
  Snowflake,
  Dumbbell,
  Tv,
  Wind,
  ShowerHead,
  Mountain,
  TreePine,
  MapPin,
  ParkingCircle,
  PawPrint,
  Fan,
  Refrigerator,
  Bath,
  Bed,
  Sofa,
  ChefHat,
  Warehouse,
  Fence,
  FireExtinguisher,
  ShieldCheck,
  Sparkles,
  CookingPot,
  BathIcon,
  Shirt,
  BookOpen,
  Music,
  PartyPopper,
  Tent,
  Flame,
  Lamp,
  Armchair,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const amenityIconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  internet: Wifi,
  parking: ParkingCircle,
  "free parking": ParkingCircle,
  breakfast: Coffee,
  restaurant: UtensilsCrossed,
  pool: Waves,
  "air conditioning": Snowflake,
  ac: Snowflake,
  conditioner: Snowflake,
  gym: Dumbbell,
  fitness: Dumbbell,
  tv: Tv,
  "room service": ChefHat,
  kitchen: CookingPot,
  "pet friendly": PawPrint,
  pets: PawPrint,
  mountain: Mountain,
  "mountain view": Mountain,
  nature: TreePine,
  sauna: Flame,
  "hot tub": Waves,
  fireplace: Flame,
  garden: TreePine,
  terrace: Fence,
  barbecue: Flame,
  grill: Flame,
  washing: Shirt,
  "washing machine": Shirt,
  iron: Shirt,
  refrigerator: Refrigerator,
  fridge: Refrigerator,
  microwave: CookingPot,
  balcony: Fence,
  "sea view": Waves,
  "lake view": Waves,
  "city view": MapPin,
  heater: Fan,
  heating: Fan,
  fan: Fan,
  accessible: ShieldCheck,
  "wheelchair": ShieldCheck,
  transfer: Car,
  shuttle: Car,
  bar: Music,
  "24/7": Sparkles,
  "24 hours": Sparkles,
  concierge: Sparkles,
  laundry: Shirt,
  cleaning: Sparkles,
  safe: ShieldCheck,
  "luggage storage": Warehouse,
  "baby cot": Bed,
  "extra bed": Bed,
  sofa: Sofa,
  "dining area": UtensilsCrossed,
  "outdoor": Tent,
};

interface AmenitiesGridProps {
  amenities: string[];
}

export default function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {amenities.map((amenity) => {
        const key = amenity.toLowerCase().trim();
        const Icon = amenityIconMap[key] || null;
        return (
          <div
            key={amenity}
            className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
          >
            {Icon ? (
              <Icon size={20} className="text-blue-600 shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">{amenity}</span>
          </div>
        );
      })}
    </div>
  );
}
