import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertFaultReportSchema, updateFaultReportStatusSchema, updateFaultReportSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + sanitizedName);
  }
});

const allowedMimeTypes = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const upload = multer({ 
  storage: fileStorage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls)$/i;
    const hasValidExtension = allowedExtensions.test(file.originalname);
    const hasValidMimeType = allowedMimeTypes.has(file.mimetype);
    
    if (hasValidExtension && hasValidMimeType) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed!'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically with security checks
  app.use('/uploads', express.static(uploadDir));

  // Enhanced fault reports endpoint with filtering and pagination
  app.get("/api/fault-reports", async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        department: req.query.department as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await storage.getFaultReports(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching fault reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get a specific fault report
  app.get("/api/fault-reports/:id", async (req, res) => {
    try {
      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching fault report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create a new fault report
  app.post("/api/fault-reports", upload.array('attachments', 5), async (req, res) => {
    try {
      // Parse form data (excluding status and attachments - they're controlled separately)
      const reportData = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        department: req.body.department,
        location: req.body.location,
        reportedBy: req.body.reportedBy
      };

      // Validate the data
      const validatedData = insertFaultReportSchema.parse(reportData);

      // Create the report with default status and attachments
      const reportToCreate = {
        ...validatedData,
        status: "pending" as const,
        attachments: req.files && Array.isArray(req.files) 
          ? req.files.map(file => file.filename) 
          : []
      };

      const newReport = await storage.createFaultReport(reportToCreate);
      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error creating fault report:", error);
      
      // Clean up uploaded files if report creation failed
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      }

      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update fault report status
  app.patch("/api/fault-reports/:id/status", async (req, res) => {
    try {
      const validatedData = updateFaultReportStatusSchema.parse(req.body);
      const updatedReport = await storage.updateFaultReportStatus(req.params.id, validatedData.status);
      
      if (!updatedReport) {
        return res.status(404).json({ error: "Fault report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating fault report status:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update fault report
  app.patch("/api/fault-reports/:id", async (req, res) => {
    try {
      const validatedData = updateFaultReportSchema.parse(req.body);
      const updatedReport = await storage.updateFaultReport(req.params.id, validatedData);
      
      if (!updatedReport) {
        return res.status(404).json({ error: "Fault report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error updating fault report:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete fault report
  app.delete("/api/fault-reports/:id", async (req, res) => {
    try {
      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }

      // Delete associated files
      if (report.attachments && report.attachments.length > 0) {
        report.attachments.forEach(filename => {
          const filePath = path.join(uploadDir, filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        });
      }

      const deleted = await storage.deleteFaultReport(req.params.id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Fault report not found" });
      }
    } catch (error) {
      console.error("Error deleting fault report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Issue job card endpoint
  app.post("/api/fault-reports/:id/issue-job-card", async (req, res) => {
    try {
      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }

      // Update status to approved (job card issued)
      const updatedReport = await storage.updateFaultReportStatus(req.params.id, "approved");
      
      res.json({
        message: "Job card issued to workshop planner",
        report: updatedReport
      });
    } catch (error) {
      console.error("Error issuing job card:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Submit procurement request endpoint
  app.post("/api/fault-reports/:id/procurement-request", async (req, res) => {
    try {
      const { priority } = req.body;
      
      if (!priority || !['24hrs', '72hrs', 'miscellaneous'].includes(priority)) {
        return res.status(400).json({ error: "Invalid priority. Must be '24hrs', '72hrs', or 'miscellaneous'" });
      }

      const report = await storage.getFaultReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Fault report not found" });
      }

      // Update status to assigned (assigned to PM)
      const updatedReport = await storage.updateFaultReportStatus(req.params.id, "assigned");
      
      res.json({
        message: "The task is assigned to PM",
        priority,
        report: updatedReport
      });
    } catch (error) {
      console.error("Error processing procurement request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add attachment to existing fault report
  app.post("/api/fault-reports/:id/attachments", upload.single('attachment'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const updatedReport = await storage.addAttachmentToReport(req.params.id, req.file.filename);
      
      if (!updatedReport) {
        // Clean up the uploaded file if report not found
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        return res.status(404).json({ error: "Fault report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error adding attachment:", error);
      
      // Clean up uploaded file on error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Remove attachment from fault report
  app.delete("/api/fault-reports/:id/attachments/:filename", async (req, res) => {
    try {
      const { id, filename } = req.params;
      
      // Verify file belongs to this report
      const hasAccess = await storage.verifyFileAccess(filename);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedReport = await storage.removeAttachmentFromReport(id, filename);
      
      if (!updatedReport) {
        return res.status(404).json({ error: "Fault report not found" });
      }

      // Delete the physical file
      const filePath = path.join(uploadDir, filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      
      res.json(updatedReport);
    } catch (error) {
      console.error("Error removing attachment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Secure file download endpoint
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      
      // Security: ensure filename doesn't contain path traversal
      if (path.basename(filename) !== filename || filename.includes('..')) {
        return res.status(400).json({ error: "Invalid filename" });
      }
      
      // Verify file access
      const hasAccess = await storage.verifyFileAccess(filename);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const filePath = path.resolve(uploadDir, filename);
      
      // Security: ensure resolved path is within uploadDir
      if (!filePath.startsWith(path.resolve(uploadDir))) {
        return res.status(400).json({ error: "Invalid file path" });
      }
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      // Set appropriate headers for different file types
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      
      // For images and PDFs, allow inline viewing
      if (ext === '.pdf' || ['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }
      
      res.sendFile(filePath);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get file information
  app.get("/api/files/:filename/info", async (req, res) => {
    try {
      const filename = req.params.filename;
      
      // Verify file access
      const hasAccess = await storage.verifyFileAccess(filename);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const filePath = path.resolve(uploadDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      
      const fileInfo = {
        filename,
        size: stats.size,
        extension: ext,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        isImage: ['.jpg', '.jpeg', '.png', '.gif'].includes(ext),
        isPdf: ext === '.pdf',
        isDocument: ['.doc', '.docx', '.txt', '.xls', '.xlsx'].includes(ext)
      };
      
      res.json(fileInfo);
    } catch (error) {
      console.error("Error getting file info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const analytics = await storage.getDashboardAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/status-distribution", async (req, res) => {
    try {
      const distribution = await storage.getStatusDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching status distribution:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/priority-breakdown", async (req, res) => {
    try {
      const breakdown = await storage.getPriorityBreakdown();
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching priority breakdown:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/department-activity", async (req, res) => {
    try {
      const activity = await storage.getDepartmentActivity();
      res.json(activity);
    } catch (error) {
      console.error("Error fetching department activity:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/trends", async (req, res) => {
    try {
      const period = req.query.period as string || '30d';
      const trends = await storage.getTrendData(period);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trend data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}