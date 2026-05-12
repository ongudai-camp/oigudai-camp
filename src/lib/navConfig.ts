import { Hotel, Map, Mountain, Compass, Star, Camera, Palmtree, Tent, Home, Waves, Snowflake } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavSection {
  title: string;
  href: string;
  items: NavItem[];
  featured?: {
    title: string;
    description: string;
    href: string;
    image?: string;
  };
}

export const navConfig: NavSection[] = [
  {
    title: "accommodation",
    href: "/hotels",
    items: [
      { title: "cottages", href: "/hotels?type=cottage", icon: Home },
      { title: "hotel_rooms", href: "/hotels?type=hotel-room", icon: Hotel },
      { title: "altai_ails", href: "/hotels?type=altai-ail", icon: Tent },
      { title: "eco_village", href: "/hotels?type=eco", icon: Palmtree },
    ],
    featured: {
      title: "new_opening",
      description: "new_opening_desc",
      href: "/hotels/ongudai-camp",
    }
  },
  {
    title: "tours",
    href: "/tours",
    items: [
      { title: "altai_ring", href: "/tours?category=ring", icon: Compass },
      { title: "horse_tours", href: "/tours?category=horse", icon: Map },
      { title: "winter_magic", href: "/tours?category=winter", icon: Snowflake },
      { title: "custom_routes", href: "/tours?category=custom", icon: Mountain },
    ],
    featured: {
      title: "popular_tour",
      description: "popular_tour_desc",
      href: "/tours/golden-ring-altay",
    }
  },
  {
    title: "experiences",
    href: "/activities",
    items: [
      { title: "rafting", href: "/activities?type=rafting", icon: Waves },
      { title: "trekking", href: "/activities?type=trekking", icon: Mountain },
      { title: "shaman_rituals", href: "/activities?type=shaman", icon: Star },
      { title: "photo_expeditions", href: "/activities?type=photo", icon: Camera },
    ],
  }
];
