export type ParameterStatus = "normal" | "low" | "high";
export type UrgencyLevel = "normal" | "consult" | "urgent";

export interface ReportParameter {
  name: string;
  value: string;
  normalRange: string;
  status: ParameterStatus;
  explanation: string;
}

export interface ReportAnalysis {
  parameters: ReportParameter[];
  summary: string;
  urgency: UrgencyLevel;
}
