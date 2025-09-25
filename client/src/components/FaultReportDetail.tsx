import type { FaultReport as TableFaultReport } from "./ReportsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type FaultReportDetailProps = {
  report: TableFaultReport & { attachments?: string[] };
  onBack: () => void;
  onIssueJobCard: (reportId: string) => void;
  onPullRequest: (reportId: string) => void;
};

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { color: "bg-status-pending text-white", label: "Pending" },
    approved: { color: "bg-status-approved text-white", label: "Approved" },
    assigned: { color: "bg-status-assigned text-white", label: "Assigned to PM" },
    rejected: { color: "bg-destructive text-destructive-foreground", label: "Rejected" },
  } as const;

  const config = (statusConfig as any)[status] ?? statusConfig.pending;
  return <Badge className={config.color}>{config.label}</Badge>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FaultReportDetail({ report, onBack, onIssueJobCard, onPullRequest }: FaultReportDetailProps) {
  const attachmentsCount = (report as any).attachments?.length ?? (report as any).files?.length ?? 0;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">{report.title}</CardTitle>
        <div className="flex gap-2">
          {getStatusBadge(report.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground">{report.description}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <span><strong>Priority:</strong> {report.priority}</span>
          <span><strong>Department:</strong> {report.department || "N/A"}</span>
          <span><strong>Location:</strong> {report.location || "N/A"}</span>
          <span><strong>Reported By:</strong> {report.reportedBy || "Anonymous"}</span>
          <span><strong>Created:</strong> {formatDate(report.createdAt)}</span>
          {attachmentsCount > 0 && (
            <span><strong>Attachments:</strong> {attachmentsCount} file(s)</span>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onBack} data-testid="button-back">
            Back to Reports
          </Button>
          <Button onClick={() => onIssueJobCard(report.id)} data-testid="button-issue-job-card">
            Issue Job Card
          </Button>
          <Button variant="secondary" onClick={() => onPullRequest(report.id)} data-testid="button-procurement">
            Procurement Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
