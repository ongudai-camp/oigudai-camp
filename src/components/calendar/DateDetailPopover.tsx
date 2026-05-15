import { X } from "lucide-react";
import AvailabilityBadge from "./AvailabilityBadge";

interface PropertyInfo {
  id: number;
  title: string;
  type: string;
  slug: string;
  image: string | null;
  status: string;
  price: number | null;
  roomCount: number;
}

interface DateDetailPopoverProps {
  dateStr: string;
  properties: Record<string, PropertyInfo[]>;
  totalAvailable: number;
  totalBooked: number;
  minPrice: number | null;
  onClose: () => void;
}

export default function DateDetailPopover({
  dateStr,
  properties,
  totalAvailable,
  totalBooked,
  minPrice,
  onClose,
}: DateDetailPopoverProps) {
  const allProperties = [...(properties.hotels || []), ...(properties.tours || []), ...(properties.activities || [])];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md mx-4 max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h3 className="font-bold text-gray-900">{dateStr}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {totalAvailable} available &middot; {totalBooked} booked
              {minPrice !== null && ` · from ₽${minPrice.toLocaleString()}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {allProperties.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No properties found for this date</p>
          )}

          {properties.hotels && properties.hotels.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Hotels</h4>
              <div className="space-y-2">
                {properties.hotels.map((prop) => (
                  <PropertyRow key={`hotel-${prop.id}`} prop={prop} />
                ))}
              </div>
            </div>
          )}

          {properties.tours && properties.tours.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Tours</h4>
              <div className="space-y-2">
                {properties.tours.map((prop) => (
                  <PropertyRow key={`tour-${prop.id}`} prop={prop} />
                ))}
              </div>
            </div>
          )}

          {properties.activities && properties.activities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Activities</h4>
              <div className="space-y-2">
                {properties.activities.map((prop) => (
                  <PropertyRow key={`activity-${prop.id}`} prop={prop} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PropertyRow({ prop }: { prop: PropertyInfo }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        {prop.image ? (
          <img
            src={prop.image}
            alt={prop.title}
            className="w-8 h-8 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{prop.title}</p>
          {prop.price !== null && (
            <p className="text-xs text-gray-500">₽{prop.price.toLocaleString()}</p>
          )}
        </div>
      </div>
      <AvailabilityBadge status={prop.status} />
    </div>
  );
}
