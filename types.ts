
export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id: string;
  timestamp: number;
  threatType: string;
  severity: Severity;
  description: string;
  actionTaken: string;
  neutralizedContent?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: string; // Base64 encoded image data
  securityEvent?: SecurityEvent;
}

export interface SystemStatus {
  immunityActive: boolean;
  anomalyScore: number;
  rejectionCount: number;
  threatsBlocked: number;
  temporalDrift?: number; // Drift in seconds
  temporalStatus?: 'nominal' | 'diverged' | 'critical';
}

export enum DashboardTab {
  CHAT = 'chat',
  SECURITY = 'security',
  MONITOR = 'monitor',
  ANALYTICS = 'analytics'
}
