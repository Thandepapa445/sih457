import FaultReportForm from '../FaultReportForm';

export default function FaultReportFormExample() {
  const handleSubmit = (report: any) => {
    console.log('Fault report submitted:', report);
  };

  return <FaultReportForm onSubmit={handleSubmit} />;
}