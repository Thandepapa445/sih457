import { type InsertUser, type InsertFaultReport, type UpdateFaultReport, type FaultReportStatus } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

// Local runtime models used by in-memory storage
export interface User {
  id: string;
  username: string;
  password: string;
}

export interface FaultReport {
  id: string;
  title: string;
  description: string;
  priority: string;
  department: string | null;
  location: string | null;
  reportedBy: string | null;
  status: FaultReportStatus;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
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

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Fault Reports
  getFaultReports(filters?: FaultReportFilters): Promise<PaginatedResult<FaultReport>>;
  getFaultReport(id: string): Promise<FaultReport | undefined>;
  createFaultReport(report: InsertFaultReport & { status?: FaultReportStatus; attachments?: string[] }): Promise<FaultReport>;
  updateFaultReport(id: string, data: UpdateFaultReport): Promise<FaultReport | undefined>;
  updateFaultReportStatus(id: string, status: FaultReportStatus): Promise<FaultReport | undefined>;
  deleteFaultReport(id: string): Promise<boolean>;
  addAttachmentToReport(reportId: string, filename: string): Promise<FaultReport | undefined>;
  removeAttachmentFromReport(reportId: string, filename: string): Promise<FaultReport | undefined>;
  verifyFileAccess(filename: string): Promise<boolean>;
  
  // Analytics
  getDashboardAnalytics(): Promise<DashboardAnalytics>;
  getStatusDistribution(): Promise<{ status: string; count: number; percentage: number }[]>;
  getPriorityBreakdown(): Promise<{ priority: string; count: number }[]>;
  getDepartmentActivity(): Promise<{ department: string; count: number }[]>;
  getTrendData(period: string): Promise<TrendData[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private faultReports: Map<string, FaultReport>;

  constructor() {
    this.users = new Map();
    this.faultReports = new Map();
    
    // Add some sample data for testing
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample reports for testing analytics
    const sampleReports = [
      {
        title: "Server Room AC Malfunction",
        description: "Air conditioning unit not working properly, temperature rising above safe levels",
        priority: "critical",
        department: "IT",
        location: "Server Room A",
        reportedBy: "John Doe",
        status: "pending" as const
      },
      {
        title: "Printer Paper Jam",
        description: "Office printer has recurring paper jams, affecting daily operations",
        priority: "low",
        department: "Administration",
        location: "Office Floor 2",
        reportedBy: "Jane Smith",
        status: "approved" as const
      },
      {
        title: "Network Connectivity Issues",
        description: "Intermittent network outages in building C affecting productivity",
        priority: "high",
        department: "IT",
        location: "Building C",
        reportedBy: "Mike Johnson",
        status: "assigned" as const
      },
      {
        title: "Broken Window in Conference Room",
        description: "Large crack in conference room window, safety hazard",
        priority: "medium",
        department: "Facilities",
        location: "Conference Room B",
        reportedBy: "Sarah Wilson",
        status: "pending" as const
      },
      {
        title: "Elevator Maintenance Required",
        description: "Elevator making strange noises and moving slowly",
        priority: "high",
        department: "Maintenance",
        location: "Main Building Elevator",
        reportedBy: "Tom Brown",
        status: "approved" as const
      },
      {
        title: "Parking Lot Lighting",
        description: "Several parking lot lights are not working, security concern",
        priority: "medium",
        department: "Security",
        location: "Parking Lot A",
        reportedBy: "Lisa Davis",
        status: "rejected" as const
      }
    ];

    // Only initialize sample data in development
    if (process.env.NODE_ENV !== 'production') {
      for (const report of sampleReports) {
        await this.createFaultReport(report);
      }
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFaultReports(filters: FaultReportFilters = {}): Promise<PaginatedResult<FaultReport>> {
    let reports = Array.from(this.faultReports.values());

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      reports = reports.filter(report => 
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        (report.reportedBy && report.reportedBy.toLowerCase().includes(searchLower)) ||
        (report.department && report.department.toLowerCase().includes(searchLower))
      );
    }

    if (filters.status && filters.status !== 'all') {
      reports = reports.filter(report => report.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      reports = reports.filter(report => report.priority === filters.priority);
    }

    if (filters.department && filters.department !== 'all') {
      reports = reports.filter(report => report.department === filters.department);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      reports = reports.filter(report => new Date(report.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      reports = reports.filter(report => new Date(report.createdAt) <= toDate);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    reports.sort((a, b) => {
      let aValue: any = a[sortBy as keyof FaultReport];
      let bValue: any = b[sortBy as keyof FaultReport];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const total = reports.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedReports = reports.slice(startIndex, endIndex);

    return {
      data: paginatedReports,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getFaultReport(id: string): Promise<FaultReport | undefined> {
    return this.faultReports.get(id);
  }

  async createFaultReport(insertReport: InsertFaultReport & { status?: FaultReportStatus; attachments?: string[] }): Promise<FaultReport> {
    const id = randomUUID();
    const now = new Date();
    const report: FaultReport = {
      id,
      title: insertReport.title,
      description: insertReport.description,
      priority: insertReport.priority,
      department: insertReport.department || null,
      location: insertReport.location || null,
      reportedBy: insertReport.reportedBy || null,
      status: insertReport.status || "pending",
      attachments: insertReport.attachments || [],
      createdAt: now,
      updatedAt: now
    };
    this.faultReports.set(id, report);
    return report;
  }

  async updateFaultReport(id: string, data: UpdateFaultReport): Promise<FaultReport | undefined> {
    const report = this.faultReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: FaultReport = {
      ...report,
      ...data,
      updatedAt: new Date()
    };
    this.faultReports.set(id, updatedReport);
    return updatedReport;
  }

  async updateFaultReportStatus(id: string, status: FaultReportStatus): Promise<FaultReport | undefined> {
    const report = this.faultReports.get(id);
    if (!report) return undefined;
    
    const updatedReport: FaultReport = {
      ...report,
      status,
      updatedAt: new Date()
    };
    this.faultReports.set(id, updatedReport);
    return updatedReport;
  }

  async deleteFaultReport(id: string): Promise<boolean> {
    return this.faultReports.delete(id);
  }

  async addAttachmentToReport(reportId: string, filename: string): Promise<FaultReport | undefined> {
    const report = this.faultReports.get(reportId);
    if (!report) return undefined;
    
    const updatedReport: FaultReport = {
      ...report,
      attachments: [...(report.attachments || []), filename],
      updatedAt: new Date()
    };
    this.faultReports.set(reportId, updatedReport);
    return updatedReport;
  }

  async removeAttachmentFromReport(reportId: string, filename: string): Promise<FaultReport | undefined> {
    const report = this.faultReports.get(reportId);
    if (!report) return undefined;
    
    const updatedAttachments = (report.attachments || []).filter(att => att !== filename);
    const updatedReport: FaultReport = {
      ...report,
      attachments: updatedAttachments,
      updatedAt: new Date()
    };
    this.faultReports.set(reportId, updatedReport);
    return updatedReport;
  }

  async verifyFileAccess(filename: string): Promise<boolean> {
    // Check if file belongs to any fault report
    for (const report of Array.from(this.faultReports.values())) {
      if (report.attachments && report.attachments.includes(filename)) {
        return true;
      }
    }
    return false;
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const reports = Array.from(this.faultReports.values());
    const total = reports.length;
    
    const statusCounts = {
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      assigned: reports.filter(r => r.status === 'assigned').length,
      rejected: reports.filter(r => r.status === 'rejected').length
    };

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    const priorityBreakdown = this.calculatePriorityBreakdown(reports);
    const departmentActivity = this.calculateDepartmentActivity(reports);
    
    // Get recent reports (last 10)
    const recentReports = reports
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalReports: total,
      pendingReports: statusCounts.pending,
      approvedReports: statusCounts.approved,
      assignedReports: statusCounts.assigned,
      rejectedReports: statusCounts.rejected,
      recentReports,
      statusDistribution,
      priorityBreakdown,
      departmentActivity
    };
  }

  async getStatusDistribution(): Promise<{ status: string; count: number; percentage: number }[]> {
    const reports = Array.from(this.faultReports.values());
    const total = reports.length;
    
    const statusCounts = {
      pending: reports.filter(r => r.status === 'pending').length,
      approved: reports.filter(r => r.status === 'approved').length,
      assigned: reports.filter(r => r.status === 'assigned').length,
      rejected: reports.filter(r => r.status === 'rejected').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }

  async getPriorityBreakdown(): Promise<{ priority: string; count: number }[]> {
    const reports = Array.from(this.faultReports.values());
    return this.calculatePriorityBreakdown(reports);
  }

  async getDepartmentActivity(): Promise<{ department: string; count: number }[]> {
    const reports = Array.from(this.faultReports.values());
    return this.calculateDepartmentActivity(reports);
  }

  async getTrendData(period: string): Promise<TrendData[]> {
    const reports = Array.from(this.faultReports.values());
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    const trendData: TrendData[] = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayReports = reports.filter(report => {
        const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
        return reportDate === dateStr;
      });
      
      trendData.push({
        date: dateStr,
        pending: dayReports.filter(r => r.status === 'pending').length,
        approved: dayReports.filter(r => r.status === 'approved').length,
        assigned: dayReports.filter(r => r.status === 'assigned').length,
        rejected: dayReports.filter(r => r.status === 'rejected').length,
        total: dayReports.length
      });
    }
    
    return trendData;
  }

  private calculatePriorityBreakdown(reports: FaultReport[]): { priority: string; count: number }[] {
    const priorityCounts: { [key: string]: number } = {};
    
    reports.forEach(report => {
      priorityCounts[report.priority] = (priorityCounts[report.priority] || 0) + 1;
    });
    
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count
    }));
  }

  private calculateDepartmentActivity(reports: FaultReport[]): { department: string; count: number }[] {
    const departmentCounts: { [key: string]: number } = {};
    
    reports.forEach(report => {
      if (report.department) {
        departmentCounts[report.department] = (departmentCounts[report.department] || 0) + 1;
      }
    });
    
    return Object.entries(departmentCounts)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const storage = new MemStorage();