import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <CardDescription className="mt-1 flex items-center text-xs">
            {trend && (
              <span
                className={cn(
                  "mr-1 flex items-center",
                  trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                {trendValue && <span className="ml-1">{trendValue}</span>}
              </span>
            )}
            {description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
