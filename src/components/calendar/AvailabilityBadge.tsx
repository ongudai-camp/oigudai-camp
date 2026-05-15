interface AvailabilityBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function AvailabilityBadge({ status, size = "sm" }: AvailabilityBadgeProps) {
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  switch (status) {
    case "available":
      return (
        <span className={`inline-block ${sizeClass} font-bold rounded-full bg-emerald-100 text-emerald-700`}>
          Free
        </span>
      );
    case "limited":
      return (
        <span className={`inline-block ${sizeClass} font-bold rounded-full bg-amber-100 text-amber-700`}>
          Limited
        </span>
      );
    case "full":
    case "booked":
      return (
        <span className={`inline-block ${sizeClass} font-bold rounded-full bg-red-100 text-red-700`}>
          Booked
        </span>
      );
    case "blocked":
      return (
        <span className={`inline-block ${sizeClass} font-bold rounded-full bg-gray-200 text-gray-500`}>
          Blocked
        </span>
      );
    default:
      return (
        <span className={`inline-block ${sizeClass} font-bold rounded-full bg-gray-100 text-gray-400`}>
          Unknown
        </span>
      );
  }
}
