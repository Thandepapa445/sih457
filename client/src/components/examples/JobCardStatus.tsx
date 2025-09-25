import JobCardStatus from '../JobCardStatus';

export default function JobCardStatusExample() {
  const handleBackToReports = () => {
    console.log('Navigating back to reports dashboard');
  };

  return (
    <JobCardStatus
      reportId="12345"
      reportTitle="Air Conditioning Not Working in Server Room"
      onBackToReports={handleBackToReports}
    />
  );
}