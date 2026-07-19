const styles: Record<string, string> = {
  none: "bg-green-100 text-green-700",
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function RiskBadge({ level }: { level: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[level] || styles.none}`}>
      {level === "none" ? "no concerns detected" : `${level} risk`}
    </span>
  );
}
