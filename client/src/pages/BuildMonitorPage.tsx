import { useRoute } from "wouter";
import BuildMonitor from "@/components/BuildMonitor";

export default function BuildMonitorPage() {
  const [, params] = useRoute("/build/:id");
  const buildId = params?.id;
  if (!buildId) {
    return <p className="p-6 text-sm text-muted-foreground">Missing build id.</p>;
  }
  return <BuildMonitor buildId={buildId} />;
}
