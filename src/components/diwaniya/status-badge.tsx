import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  isOpen: boolean;
  className?: string;
}

export function DiwaniyaStatusBadge({ isOpen, className }: StatusBadgeProps) {
  return (
    <Badge variant={isOpen ? "open" : "closed"} className={cn(className)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isOpen
            ? "bg-primary ring-2 ring-primary/20"
            : "bg-muted-foreground"
        )}
      />
      {isOpen ? "Open tonight" : "Closed"}
    </Badge>
  );
}

interface RegistrationStatusBadgeProps {
  status: "pending" | "approved" | "rejected";
  className?: string;
}

export function RegistrationStatusBadge({
  status,
  className,
}: RegistrationStatusBadgeProps) {
  const variants = {
    pending: "warning",
    approved: "success",
    rejected: "destructive",
  } as const;

  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <Badge variant={variants[status]} className={cn(className)}>
      {labels[status]}
    </Badge>
  );
}
