import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ProcurementRequestProps {
  reportId: string;
  reportTitle: string;
  reportDescription: string;
  onBack?: () => void;
  onSubmit?: (reportId: string, priority: string) => void;
}

export default function ProcurementRequest({ 
  reportId, 
  reportTitle, 
  reportDescription,
  onBack, 
  onSubmit 
}: ProcurementRequestProps) {
  const [selectedPriority, setSelectedPriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const priorityOptions = [
    {
      value: "24hrs",
      label: "24 Hours",
      description: "Urgent - Critical business impact",
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      value: "72hrs", 
      label: "72 Hours",
      description: "High priority - Significant impact",
      icon: Clock,
      color: "text-status-pending"
    },
    {
      value: "miscellaneous",
      label: "Miscellaneous",
      description: "Standard priority - Routine procurement",
      icon: ShoppingCart,
      color: "text-status-assigned"
    }
  ];

  const handleSubmit = async () => {
    if (!selectedPriority) {
      toast({
        title: "Priority Required",
        description: "Please select a priority level before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    toast({
      title: "Request Submitted",
      description: "The task has been assigned to Procurement Manager",
    });

    // Call onSubmit callback after a delay to show success state
    setTimeout(() => {
      onSubmit?.(reportId, selectedPriority);
    }, 2000);
  };

  const getSelectedPriorityInfo = () => {
    return priorityOptions.find(option => option.value === selectedPriority);
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            data-testid="button-back-success"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>

        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-status-assigned rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-semibold text-status-assigned" data-testid="text-submission-success">
              Request Submitted Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground" data-testid="text-assignment-message">
                The task has been assigned to Procurement Manager
              </p>
              <p className="text-sm text-muted-foreground">
                Priority: <span className="font-medium">{getSelectedPriorityInfo()?.label}</span>
              </p>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium mb-2">What happens next?</p>
              <div className="text-xs text-muted-foreground space-y-1" data-testid="text-procurement-next-steps">
                <p>• Procurement Manager will review the request</p>
                <p>• Vendor quotes will be obtained if needed</p>
                <p>• Purchase orders will be created and processed</p>
                <p>• You will receive updates on procurement status</p>
              </div>
            </div>

            <Button 
              onClick={onBack}
              className="w-full"
              data-testid="button-return-procurement"
            >
              Return to Reports Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={onBack}
          data-testid="button-back-procurement"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Report Details
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold" data-testid="text-procurement-title">
            Procurement Request
          </CardTitle>
          <p className="text-muted-foreground">
            Submit a procurement request to the Procurement Manager
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Report Details</Label>
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="font-medium text-sm" data-testid="text-procurement-report-title">{reportTitle}</p>
              <p className="text-xs text-muted-foreground" data-testid="text-procurement-report-id">
                Report ID: {reportId}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-3" data-testid="text-procurement-description">
                {reportDescription}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Priority Level</Label>
              <p className="text-sm text-muted-foreground">
                Select the urgency level for this procurement request
              </p>
            </div>

            <RadioGroup
              value={selectedPriority}
              onValueChange={setSelectedPriority}
              className="space-y-3"
              data-testid="radio-group-priority"
            >
              {priorityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-3 p-4 rounded-lg border hover-elevate cursor-pointer ${
                      selectedPriority === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedPriority(option.value)}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      data-testid={`radio-${option.value}`}
                    />
                    <Icon className={`h-6 w-6 ${option.color}`} />
                    <div className="flex-1">
                      <Label
                        htmlFor={option.value}
                        className="font-medium cursor-pointer"
                        data-testid={`label-${option.value}`}
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>

            {selectedPriority && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground">
                    Selected Priority
                  </Badge>
                </div>
                <p className="text-sm" data-testid="text-selected-priority">
                  <strong>{getSelectedPriorityInfo()?.label}:</strong> {getSelectedPriorityInfo()?.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedPriority || isSubmitting}
              className="flex-1"
              data-testid="button-submit-procurement"
            >
              {isSubmitting ? "Submitting Request..." : "Submit Request"}
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              data-testid="button-cancel-procurement"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}