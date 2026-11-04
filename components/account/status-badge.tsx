import { Badge } from "@/components/ui/badge";
import { statusInfo } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  const s = statusInfo(status);
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}
