import ReportsTable, { FaultReport } from '../ReportsTable';

// TODO: remove mock functionality
const mockReports: FaultReport[] = [
  {
    id: "1",
    title: "Air Conditioning Not Working in Server Room",
    description: "The main air conditioning unit in the server room has stopped working, causing temperature to rise above safe levels for equipment.",
    priority: "critical",
    department: "IT",
    location: "Building A, Floor 2, Server Room",
    reportedBy: "John Smith",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2", 
    title: "Elevator Making Strange Noises",
    description: "The main elevator is making grinding noises when moving between floors. Possibly a mechanical issue with the motor.",
    priority: "high",
    department: "Maintenance",
    location: "Building B, Main Elevator",
    reportedBy: "Sarah Johnson",
    status: "approved",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Broken Window in Conference Room",
    description: "Large crack in the window of Conference Room C. Needs immediate attention for safety reasons.",
    priority: "medium",
    department: "Facilities",
    location: "Building A, Floor 3, Conference Room C",
    reportedBy: "Mike Davis",
    status: "assigned",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

export default function ReportsTableExample() {
  const handleViewReport = (report: FaultReport) => {
    console.log('Viewing report:', report);
  };

  const handleUpdateStatus = (reportId: string, status: string) => {
    console.log('Updating report status:', reportId, status);
  };

  return (
    <ReportsTable 
      reports={mockReports}
      onViewReport={handleViewReport}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}