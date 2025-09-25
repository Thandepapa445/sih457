import ProcurementRequest from '../ProcurementRequest';

export default function ProcurementRequestExample() {
  const handleBack = () => {
    console.log('Navigating back from procurement request');
  };

  const handleSubmit = (reportId: string, priority: string) => {
    console.log('Submitting procurement request:', reportId, priority);
  };

  return (
    <ProcurementRequest
      reportId="12345"
      reportTitle="Air Conditioning Not Working in Server Room"
      reportDescription="The main air conditioning unit in the server room has stopped working, causing temperature to rise above safe levels for equipment. This issue was first noticed this morning around 9:00 AM when the temperature monitoring system triggered an alert."
      onBack={handleBack}
      onSubmit={handleSubmit}
    />
  );
}