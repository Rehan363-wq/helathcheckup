export interface SkinAnalysisResponse {
  condition: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  description: string;
  recommendation: string;
  disclaimer: string;
}

export interface ReportParameter {
  name: string;
  value: string;
  normalRange: string;
  status: "normal" | "low" | "high";
  explanation: string;
}

export interface ReportAnalysisResponse {
  parameters: ReportParameter[];
  summary: string;
  urgency: "normal" | "consult" | "urgent";
}

export interface ChatBotResponse {
  reply: string;
  recommendedSpecialization?: string | null;
  suggestedMedicine?: string | null;
}
