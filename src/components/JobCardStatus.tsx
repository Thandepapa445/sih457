import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Wrench, Clock } from "lucide-react";

export interface JobCardStatusProps {
  reportId: string;
  reportTitle: string;
  onBackToReports?: () => void;
}

export default function JobCardStatus({ reportId, reportTitle, onBackToReports }: JobCardStatusProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onBackToReports}
          data-testid="button-back-to-reports"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
      </div>

      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-status-approved rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-semibold text-status-approved" data-testid="text-success-title">
            Job Card Issued Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground" data-testid="text-success-message">
              Job card has been issued to workshop planner
            </p>
            <p className="text-sm text-muted-foreground" data-testid="text-report-reference">
              For report: <span className="font-medium">{reportTitle}</span>
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-report-id">
              Report ID: {reportId}
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-status-approved rounded-full flex items-center justify-center">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm" data-testid="text-status-approved">Status: Approved</p>
                <p className="text-xs text-muted-foreground">The fault report has been approved for workshop action</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-status-pending rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm" data-testid="text-next-step">Next Step: Workshop Planning</p>
                <p className="text-xs text-muted-foreground">Workshop planner will review and assign technicians</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">What happens next?</p>
            <div className="text-xs text-muted-foreground space-y-1" data-testid="text-next-steps">
              <p>• Workshop planner will receive the job card notification</p>
              <p>• Appropriate technicians will be assigned to the task</p>
              <p>• Work will be scheduled based on priority and resource availability</p>
              <p>• You will receive updates on the repair progress</p>
            </div>
          </div>

          <Button 
            onClick={onBackToReports}
            className="w-full"
            data-testid="button-return-dashboard"
          >
            Return to Reports Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}