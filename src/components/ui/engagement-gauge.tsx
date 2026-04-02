interface EngagementGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function EngagementGauge({ score, size = "md" }: EngagementGaugeProps) {
  const getColor = (score: number): string => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 60) return "#84cc16"; // lime
    if (score >= 40) return "#eab308"; // yellow
    if (score >= 20) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const color = getColor(score);
  const radius = size === "sm" ? 18 : size === "md" ? 22 : 28;
  const strokeWidth = size === "sm" ? 3 : size === "md" ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg className="transform -rotate-90" width="100%" height="100%">
        {/* Background circle - always visible */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />
        {/* Progress circle - only visible if score > 0 */}
        {score > 0 && (
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        )}
      </svg>
      {/* Score text */}
      <div className={`absolute inset-0 flex items-center justify-center ${textSizeClasses[size]} font-bold`}>
        {score}
      </div>
    </div>
  );
}
