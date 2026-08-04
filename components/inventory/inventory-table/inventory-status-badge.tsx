interface InventoryStatusBadgeProps {
  status: string;
}

export function InventoryStatusBadge({
  status,
}: InventoryStatusBadgeProps) {
  const styles = {
    "In Stock":
      "bg-emerald-50 text-emerald-700 border border-emerald-200",

    "Low Stock":
      "bg-amber-50 text-amber-700 border border-amber-200",

    Critical:
      "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status as keyof typeof styles]
      }`}
    >
      {status}
    </span>
  );
}