import type { FaultReport } from "@/components/ReportsTable";

export interface CreateFaultReportData {
  title: string;
  description: string;
  priority: string;
  department?: string;
  location?: string;
  reportedBy?: string;
}

export interface UpdateStatusData {
  status: 'pending' | 'approved' | 'assigned' | 'rejected';
}

export interface ProcurementRequestData {
  priority: '24hrs' | '72hrs' | 'miscellaneous';
}

export interface FaultReportFilters {
  search?: string;
  status?: string;
  priority?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardAnalytics {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  assignedReports: number;
  rejectedReports: number;
  recentReports: FaultReport[];
  statusDistribution: { status: string; count: number; percentage: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  departmentActivity: { department: string; count: number }[];
}

export interface TrendData {
  date: string;
  pending: number;
  approved: number;
  assigned: number;
  rejected: number;
  total: number;
}

export interface FileInfo {
  filename: string;
  size: number;
  extension: string;
  created: string;
  modified: string;
  isImage: boolean;
  isPdf: boolean;
  isDocument: boolean;
}
class ApiClient {
  private baseUrl = '/api';

  async fetchFaultReports(filters?: FaultReportFilters): Promise<PaginatedResult<FaultReport>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = params.toString() ? `${this.baseUrl}/fault-reports?${params}` : `${this.baseUrl}/fault-reports`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch fault reports');
    }
    return response.json();
  }

  async getFaultReport(id: string): Promise<FaultReport> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch fault report');
    }
    return response.json();
  }

  async createFaultReport(data: CreateFaultReportData, files?: File[]): Promise<FaultReport> {
    const formData = new FormData();
    
    // Add text data
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    // Add files
    if (files && files.length > 0) {
      files.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await fetch(`${this.baseUrl}/fault-reports`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create fault report');
    }
    
    return response.json();
  }

  async updateFaultReportStatus(id: string, data: UpdateStatusData): Promise<FaultReport> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update status');
    }
    
    return response.json();
  }

  async issueJobCard(id: string): Promise<{ message: string; report: FaultReport }> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/issue-job-card`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to issue job card');
    }
    
    return response.json();
  }

  async submitProcurementRequest(id: string, data: ProcurementRequestData): Promise<{ message: string; priority: string; report: FaultReport }> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/procurement-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit procurement request');
    }
    
    return response.json();
  }

  async deleteFaultReport(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete fault report');
    }
  }

  async addAttachment(id: string, file: File): Promise<FaultReport> {
    const formData = new FormData();
    formData.append('attachment', file);

    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/attachments`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add attachment');
    }
    
    return response.json();
  }

  async removeAttachment(id: string, filename: string): Promise<FaultReport> {
    const response = await fetch(`${this.baseUrl}/fault-reports/${id}/attachments/${filename}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove attachment');
    }
    
    return response.json();
  }

  async getFileInfo(filename: string): Promise<FileInfo> {
    const response = await fetch(`${this.baseUrl}/files/${filename}/info`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get file info');
    }
    return response.json();
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const response = await fetch(`${this.baseUrl}/analytics/dashboard`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard analytics');
    }
    return response.json();
  }

  async getStatusDistribution(): Promise<{ status: string; count: number; percentage: number }[]> {
    const response = await fetch(`${this.baseUrl}/analytics/status-distribution`);
    if (!response.ok) {
      throw new Error('Failed to fetch status distribution');
    }
    return response.json();
  }

  async getPriorityBreakdown(): Promise<{ priority: string; count: number }[]> {
    const response = await fetch(`${this.baseUrl}/analytics/priority-breakdown`);
    if (!response.ok) {
      throw new Error('Failed to fetch priority breakdown');
    }
    return response.json();
  }

  async getDepartmentActivity(): Promise<{ department: string; count: number }[]> {
    const response = await fetch(`${this.baseUrl}/analytics/department-activity`);
    if (!response.ok) {
      throw new Error('Failed to fetch department activity');
    }
    return response.json();
  }

  async getTrendData(period: string = '30d'): Promise<TrendData[]> {
    const response = await fetch(`${this.baseUrl}/analytics/trends?period=${period}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trend data');
    }
    return response.json();
  }
  getFileDownloadUrl(filename: string): string {
    return `${this.baseUrl}/files/${filename}`;
  }

  getFileViewUrl(filename: string): string {
    return `${this.baseUrl}/files/${filename}`;
  }
}

export const apiClient = new ApiClient();