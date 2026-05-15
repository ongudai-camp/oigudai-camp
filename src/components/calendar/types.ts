export interface PropertyInfo {
  id: number;
  title: string;
  type: string;
  slug: string;
  image: string | null;
  status: string;
  price: number | null;
  roomCount: number;
}

export interface DateInfo {
  status: "available" | "limited" | "full" | "past";
  properties: Record<string, PropertyInfo[]>;
  totalAvailable: number;
  totalBooked: number;
  minPrice: number | null;
}

export interface CalendarResponse {
  year: number;
  month: number;
  dates: Record<string, DateInfo>;
  summary: {
    totalProperties: number;
    availableDates: number;
    limitedDates: number;
    fullDates: number;
  };
}
