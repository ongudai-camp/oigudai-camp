export default function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-emerald-200" />
        <span className="text-gray-600 font-medium">Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-amber-200" />
        <span className="text-gray-600 font-medium">Limited</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-red-200" />
        <span className="text-gray-600 font-medium">Booked</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-gray-200" />
        <span className="text-gray-600 font-medium">Past</span>
      </div>
    </div>
  );
}
