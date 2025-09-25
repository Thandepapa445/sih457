import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { FaultReport } from "./ReportsTable";

export interface FaultReportFormProps {
  onSubmit?: (report: FaultReport) => void;
}

export default function FaultReportForm({ onSubmit }: FaultReportFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    department: "",
    location: "",
    reportedBy: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: (data: { formData: typeof formData; files: File[] }) => 
      apiClient.createFaultReport(data.formData, data.files),
    onSuccess: (report) => {
      toast({
        title: "Report Submitted",
        description: "Your fault report has been submitted successfully",
      });
      
      // Invalidate and refetch reports
      queryClient.invalidateQueries({ queryKey: ["/api/fault-reports"] });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "",
        department: "",
        location: "",
        reportedBy: ""
      });
      setSelectedFiles([]);
      
      onSubmit?.(report);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createReportMutation.mutate({ formData, files: selectedFiles });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Submit Fault Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" data-testid="label-title">Report Title *</Label>
              <Input
                id="title"
                data-testid="input-title"
                placeholder="Brief description of the fault"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" data-testid="label-priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger data-testid="select-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department" data-testid="label-department">Department</Label>
              <Input
                id="department"
                data-testid="input-department"
                placeholder="e.g., IT, Maintenance, Operations"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" data-testid="label-location">Location</Label>
              <Input
                id="location"
                data-testid="input-location"
                placeholder="Building, Floor, Room"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportedBy" data-testid="label-reported-by">Reported By</Label>
            <Input
              id="reportedBy"
              data-testid="input-reported-by"
              placeholder="Your name"
              value={formData.reportedBy}
              onChange={(e) => handleInputChange("reportedBy", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" data-testid="label-description">Description *</Label>
            <Textarea
              id="description"
              data-testid="textarea-description"
              placeholder="Detailed description of the fault, including when it occurred, symptoms, and any relevant information"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label data-testid="label-attachments">Attachments</Label>
            <div className="border-2 border-dashed border-border rounded-md p-4">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  data-testid="label-file-upload"
                >
                  Click to upload or drag and drop files
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  data-testid="input-file-upload"
                />
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium">Selected Files:</Label>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                    data-testid={`file-item-${index}`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createReportMutation.isPending}
              className="flex-1"
              data-testid="button-submit"
            >
              {createReportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  title: "",
                  description: "",
                  priority: "",
                  department: "",
                  location: "",
                  reportedBy: ""
                });
                setSelectedFiles([]);
              }}
              data-testid="button-clear"
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}