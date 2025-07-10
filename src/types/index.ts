export interface EmailData {
  id: string;
  subject: string;
  content: string;
  recipients: string[];
  sender: string;
  timestamp: string;
  status: 'sent' | 'pending' | 'failed';
  replies: Reply[];
  attachments?: string[];
  isHtml?: boolean;
}

export interface Reply {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  tags: string[];
  createdAt: string;
  lastUsed?: string;
}

export interface AppSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  enableSSL: boolean;
  enableTracking: boolean;
  batchSize: number;
  delayBetweenBatches: number;
}