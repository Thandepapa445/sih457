import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Plus, Home, BarChart3 } from "lucide-react";
import { apiClient } from "./lib/api";

import FaultReportForm from "./components/FaultReportForm";
import ReportsTable, { type FaultReport } from "./components/ReportsTable";
import FaultReportDetail from "./components/FaultReportDetail";
import JobCardStatus from "./components/JobCardStatus";
import ProcurementRequest from "./components/ProcurementRequest";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import ThemeToggle from "./components/ThemeToggle";

type AppView = 
  | { type: 'dashboard' }
  | { type: 'analytics' }
  | { type: 'detail'; report: FaultReport }
  | { type: 'job-card'; reportId: string; reportTitle: string }
  | { type: 'procurement'; report: FaultReport };

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>({ type: 'dashboard' });
  
  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/fault-reports"],
    queryFn: () => apiClient.fetchFaultReports()
  });

  const reports = reportsData?.data || [];
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FaultReport['status'] }) => 
      apiClient.updateFaultReportStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fault-reports"] });
    }
  });

  const issueJobCardMutation = useMutation({
    mutationFn: (id: string) => apiClient.issueJobCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fault-reports"] });
    }
  });

  const procurementMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: string }) => 
      apiClient.submitProcurementRequest(id, { priority: priority as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fault-reports"] });
    }
  });

  const handleSubmitReport = (newReport: FaultReport) => {
    console.log('New fault report submitted:', newReport);
    refetch(); // Refresh the reports list
  };

  const handleViewReport = (report: FaultReport) => {
    setCurrentView({ type: 'detail', report });
  };

  const handleUpdateStatus = (reportId: string, status: string) => {
    updateStatusMutation.mutate({ id: reportId, status: status as FaultReport['status'] });
    console.log('Report status updated:', reportId, status);
  };

  const handleIssueJobCard = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      issueJobCardMutation.mutate(reportId);
      setCurrentView({ type: 'job-card', reportId, reportTitle: report.title });
    }
  };

  const handlePullRequest = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      setCurrentView({ type: 'procurement', report });
    }
  };

  const handleProcurementSubmit = (reportId: string, priority: string) => {
    procurementMutation.mutate({ id: reportId, priority });
    setCurrentView({ type: 'dashboard' });
    console.log('Procurement request submitted:', reportId, priority);
  };

  const handleBackToDashboard = () => {
    setCurrentView({ type: 'dashboard' });
  };

  const getStatusCounts = () => {
    return {
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      assigned: reports.filter(r => r.status === 'assigned').length,
       total: reportsData?.total || 0
    };
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fault reports...</p>
        </div>
      </div>
    );
  }

  if (currentView.type === 'analytics') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <AnalyticsDashboard onBack={handleBackToDashboard} />
        </div>
      </div>
    );
  }
  if (currentView.type === 'detail') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <FaultReportDetail
            report={currentView.report}
            onBack={handleBackToDashboard}
            onIssueJobCard={handleIssueJobCard}
            onPullRequest={handlePullRequest}
          />
        </div>
      </div>
    );
  }

  if (currentView.type === 'job-card') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <JobCardStatus
            reportId={currentView.reportId}
            reportTitle={currentView.reportTitle}
            onBackToReports={handleBackToDashboard}
          />
        </div>
      </div>
    );
  }

  if (currentView.type === 'procurement') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <ProcurementRequest
            reportId={currentView.report.id}
            reportTitle={currentView.report.title}
            reportDescription={currentView.report.description}
            onBack={() => setCurrentView({ type: 'detail', report: currentView.report })}
            onSubmit={handleProcurementSubmit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold" data-testid="text-app-title">
                  Fault Report Management System
                </h1>
                <p className="text-sm text-muted-foreground">
                  Streamlined workflow for fault reporting and resolution
                </p>
              </div>
            </div>
            <ThemeToggle />
              <Button
                variant="outline"
                onClick={() => setCurrentView({ type: 'analytics' })}
                data-testid="button-analytics"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-semibold" data-testid="stat-total">{statusCounts.total}</p>
                </div>
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-semibold" data-testid="stat-pending">{statusCounts.pending}</p>
                </div>
                <Badge className="bg-status-pending text-white">
                  {statusCounts.pending}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-semibold" data-testid="stat-approved">{statusCounts.approved}</p>
                </div>
                <Badge className="bg-status-approved text-white">
                  {statusCounts.approved}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned to PM</p>
                  <p className="text-2xl font-semibold" data-testid="stat-assigned">{statusCounts.assigned}</p>
                </div>
                <Badge className="bg-status-assigned text-white">
                  {statusCounts.assigned}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="reports" className="flex items-center gap-2" data-testid="tab-reports">
              <ClipboardList className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="submit" className="flex items-center gap-2" data-testid="tab-submit">
              <Plus className="h-4 w-4" />
              Submit Report
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="mt-6">
            <ReportsTable
              reports={reports}
              onViewReport={handleViewReport}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
          
          <TabsContent value="submit" className="mt-6">
            <FaultReportForm onSubmit={handleSubmitReport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;