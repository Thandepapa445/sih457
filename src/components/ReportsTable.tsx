import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Filter, MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FaultReport {
  id: string;
  title: string;
  description: string;
  priority: string;
  department: string;
  location: string;
  reportedBy: string;
  status: 'pending' | 'approved' | 'assigned' | 'rejected';
  createdAt: string;
  files?: File[];
}

export interface ReportsTableProps {
  reports: FaultReport[];
  onViewReport?: (report: FaultReport) => void;
  onUpdateStatus?: (reportId: string, status: string) => void;
}

export default function ReportsTable({ reports, onViewReport, onUpdateStatus }: ReportsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-status-pending text-white", label: "Pending" },
      approved: { color: "bg-status-approved text-white", label: "Approved" },
      assigned: { color: "bg-status-assigned text-white", label: "Assigned to PM" },
      rejected: { color: "bg-destructive text-destructive-foreground", label: "Rejected" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color} data-testid={`status-${status}`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: "bg-secondary text-secondary-foreground", label: "Low" },
      medium: { color: "bg-status-pending text-white", label: "Medium" },
      high: { color: "bg-status-assigned text-white", label: "High" },
      critical: { color: "bg-destructive text-destructive-foreground", label: "Critical" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
    
    return (
      <Badge variant="outline" className={config.color} data-testid={`priority-${priority}`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-semibold" data-testid="title-reports">
            Fault Reports
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-32" data-testid="select-priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredReports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-reports">
            No fault reports found matching your criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover-elevate cursor-pointer" data-testid={`card-report-${report.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-semibold text-lg" data-testid={`title-${report.id}`}>
                          {report.title}
                        </h3>
                        <div className="flex gap-2">
                          {getStatusBadge(report.status)}
                          {getPriorityBadge(report.priority)}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2" data-testid={`description-${report.id}`}>
                        {report.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span data-testid={`department-${report.id}`}>
                          <strong>Department:</strong> {report.department || 'N/A'}
                        </span>
                        <span data-testid={`location-${report.id}`}>
                          <strong>Location:</strong> {report.location || 'N/A'}
                        </span>
                        <span data-testid={`reported-by-${report.id}`}>
                          <strong>By:</strong> {report.reportedBy || 'Anonymous'}
                        </span>
                        <span data-testid={`created-at-${report.id}`}>
                          <strong>Created:</strong> {formatDate(report.createdAt)}
                        </span>
                      </div>
                      
                      {report.files && report.files.length > 0 && (
                        <div className="text-sm text-muted-foreground" data-testid={`attachments-${report.id}`}>
                          <strong>Attachments:</strong> {report.files.length} file(s)
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewReport?.(report)}
                        data-testid={`button-view-${report.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-actions-${report.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onUpdateStatus?.(report.id, 'approved')}>
                            Mark as Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus?.(report.id, 'assigned')}>
                            Assign to PM
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus?.(report.id, 'rejected')}>
                            Mark as Rejected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}