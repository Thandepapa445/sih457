import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, Users, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useState } from "react";

export interface AnalyticsDashboardProps {
  onBack?: () => void;
}

export default function AnalyticsDashboard({ onBack }: AnalyticsDashboardProps) {
  const [trendPeriod, setTrendPeriod] = useState("30d");

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: () => apiClient.getDashboardAnalytics()
  });

  const { data: statusDistribution, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/analytics/status-distribution"],
    queryFn: () => apiClient.getStatusDistribution()
  });

  const { data: priorityBreakdown, isLoading: priorityLoading } = useQuery({
    queryKey: ["/api/analytics/priority-breakdown"],
    queryFn: () => apiClient.getPriorityBreakdown()
  });

  const { data: departmentActivity, isLoading: departmentLoading } = useQuery({
    queryKey: ["/api/analytics/department-activity"],
    queryFn: () => apiClient.getDepartmentActivity()
  });

  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ["/api/analytics/trends", trendPeriod],
    queryFn: () => apiClient.getTrendData(trendPeriod)
  });

  const isLoading = analyticsLoading || statusLoading || priorityLoading || departmentLoading || trendLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'assigned': return <Users className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-status-pending';
      case 'approved': return 'bg-status-approved';
      case 'assigned': return 'bg-status-assigned';
      case 'rejected': return 'bg-status-rejected';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-status-assigned';
      case 'medium': return 'bg-status-pending';
      case 'low': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          data-testid="button-back-analytics"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">
          Analytics Dashboard
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold" data-testid="analytics-total">
                  {analytics?.totalReports || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-status-pending" data-testid="analytics-pending">
                  {analytics?.pendingReports || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-status-pending" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-status-approved" data-testid="analytics-approved">
                  {analytics?.approvedReports || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-status-approved" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-3xl font-bold text-status-assigned" data-testid="analytics-assigned">
                  {analytics?.assignedReports || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-status-assigned" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="priority">Priority</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusDistribution?.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <span className="capitalize font-medium">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {item.count}
                        </span>
                        <span className="text-xs text-muted-foreground w-8">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Department Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentActivity?.slice(0, 6).map((item, index) => (
                    <div key={item.department} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium">{item.department}</span>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusDistribution?.map((item) => (
                  <Card key={item.status} className="border-2">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${getStatusColor(item.status)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <div className="text-white">
                          {getStatusIcon(item.status)}
                        </div>
                      </div>
                      <h3 className="font-semibold capitalize mb-2">{item.status}</h3>
                      <p className="text-3xl font-bold mb-1">{item.count}</p>
                      <p className="text-sm text-muted-foreground">{item.percentage}% of total</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {priorityBreakdown?.map((item) => (
                  <Card key={item.priority} className="border-2">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${getPriorityColor(item.priority)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold capitalize mb-2">{item.priority}</h3>
                      <p className="text-3xl font-bold">{item.count}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trend Analysis</CardTitle>
              <Select value={trendPeriod} onValueChange={setTrendPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trendData?.slice(-10).map((item) => (
                  <div key={item.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Pending</div>
                        <div className="font-semibold text-status-pending">{item.pending}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Approved</div>
                        <div className="font-semibold text-status-approved">{item.approved}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Assigned</div>
                        <div className="font-semibold text-status-assigned">{item.assigned}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="font-semibold">{item.total}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.recentReports?.slice(0, 5).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate">
                <div className="flex-1">
                  <h4 className="font-medium">{report.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={getPriorityColor(report.priority)}>
                      {report.priority}
                    </Badge>
                    {report.department && (
                      <Badge variant="outline">
                        {report.department}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}