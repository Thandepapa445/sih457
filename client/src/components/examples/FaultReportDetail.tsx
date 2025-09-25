import FaultReportDetail from '../FaultReportDetail';
import type { FaultReport } from '../ReportsTable';

// TODO: remove mock functionality
const mockReport: FaultReport = {
  id: "1",
  title: "Air Conditioning Not Working in Server Room",
  description: "The main air conditioning unit in the server room has stopped working, causing temperature to rise above safe levels for equipment. This issue was first noticed this morning around 9:00 AM when the temperature monitoring system triggered an alert. The temperature has steadily increased from 68°F to 82°F over the past 3 hours. Multiple servers are at risk of overheating, and we need immediate attention to prevent potential hardware damage and data loss.",
  priority: "critical",
  department: "IT",
  location: "Building A, Floor 2, Server Room",
  reportedBy: "John Smith",
  status: "pending",
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  files: [
    new File(["temperature-log"], "temperature-log.txt", { type: "text/plain" }),
    new File(["server-status"], "server-status.pdf", { type: "application/pdf" })
  ]
};

export default function FaultReportDetailExample() {
  const handleBack = () => {
    console.log('Navigating back to reports');
  };

  const handleIssueJobCard = (reportId: string) => {
    console.log('Issuing job card for report:', reportId);
  };

  const handlePullRequest = (reportId: string) => {
    console.log('Creating pull request for report:', reportId);
  };

  return (
    <FaultReportDetail
      report={mockReport}
      onBack={handleBack}
      onIssueJobCard={handleIssueJobCard}
      onPullRequest={handlePullRequest}
    />
  );
}