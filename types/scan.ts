export type SeverityLevel = "low" | "medium" | "high";

export interface ScanResult {
  condition: string;
  confidence: number;
  severity: SeverityLevel;
  description: string;
  recommendation: string;
  disclaimer: string;
}
