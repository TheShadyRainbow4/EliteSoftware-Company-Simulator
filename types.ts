export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string; // Only used for creation, not stored in active state
  signature: string;
  isAdmin?: boolean;
  company: string;
  domain: string;
  age: number;
  birthday?: string;
  role: string;
  department: string;
  reportsTo?: string; // Manager's email
  family?: { [key: string]: string };
  relationships?: { [email: string]: 'friendly' | 'neutral' | 'rival' };
}

export interface Coworker {
  id: string;
  name: string;
  email: string;
  company: string;
  domain: string;
  personality: string;
  age: number;
  birthday?: string;
  signature: string;
  role: string;
  department: string;
  reportsTo?: string; // Manager's email
  isAdmin?: boolean;
  family?: { [key: string]: string }; // e.g., { spouse: 'David', son: 'Leo' }
  relationships?: { [email: string]: 'friendly' | 'neutral' | 'rival' };
}

export interface Email {
  id: string;
  from: string; // email address
  to: string[]; // email addresses
  cc?: string[]; // email addresses
  bcc?: string[]; // email addresses
  subject: string;
  body: string;
  signature?: string;
  timestamp: number;
  attachments?: { type: 'image'; data: string; }[]; // Base64 image data
}

export enum ThreadStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Deleted = 'DELETED',
}

export interface Thread {
  id: string;
  emails: Email[];
  participants: string[]; // emails
  userStatuses: { [userEmail: string]: ThreadStatus };
  highEngagement?: boolean;
}

export interface Project {
  id: string;
  name: string;
  brief: string;
  memberEmails: string[];
  status: 'Active' | 'Completed' | 'On Hold';
  threadId?: string;
  deadline?: string; // ISO 8601 string
  completionRecipientEmail?: string;
}

export enum View {
  Inbox = 'INBOX',
  Directory = 'DIRECTORY',
  OrgChart = 'ORG_CHART',
  Admin = 'ADMIN',
  Schedule = 'SCHEDULE',
  Messenger = 'MESSENGER',
  Projects = 'PROJECTS',
  SocialMedia = 'SOCIAL_MEDIA',
  Relationships = 'RELATIONSHIPS',
}

export interface CompanyProfile {
  tagline: string;
  rules: string[];
}

export interface Role {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
  allDay: boolean;
  reminderSent?: boolean;
  isSystem?: boolean; // For hidden deadline events
  projectId?: string;
  taskDetails?: {
      description: string;
      assigneeEmail: string;
      completionRecipientEmail: string;
  }
}

export interface IMMessage {
    id: string;
    conversationId: string;
    senderEmail: string;
    content: string;
    timestamp: number;
    isTyping?: boolean;
}

export interface IMConversation {
    id: string;
    participantEmails: string[];
    groupName?: string;
    highEngagement?: boolean;
}

export type AiAction =
    | { type: 'SEND_EMAIL', payload: { to: string[], cc?: string[], subject: string, body: string } }
    | { type: 'CREATE_EVENT', payload: { title: string, description: string, start: string, end: string, allDay: boolean, isSystem?: boolean, projectId?: string, taskDetails?: Event['taskDetails'] } };

export interface AiIMResponse {
    text: string;
    action?: AiAction;
}

export interface AiEmailActionResponse {
    email: Omit<Email, 'id' | 'timestamp' | 'attachments'>;
    action?: AiAction;
    imagePrompt?: string;
}

export interface SocialComment {
  id: string;
  postId: string;
  authorEmail: string;
  content: string;
  timestamp: number;
}

export interface SocialPost {
  id: string;
  authorEmail: string; // can be a user or coworker email
  content: string;
  timestamp: number;
  likes: string[]; // array of emails
  comments: SocialComment[];
  highEngagement?: boolean;
}

export interface GeneratedCoworker {
    name: string;
    email: string;
    personality: string;
    age: number;
    signature: string;
    role: string;
    department: string;
    reportsTo?: string;
    isAdmin?: boolean;
    family?: { relation: string; name: string }[];
    relationships?: { email: string, type: 'friendly' | 'neutral' | 'rival' }[];
}

export interface GeneratedProject {
    name: string;
    brief: string;
    memberEmails: string[];
}

export interface GeneratedEvent {
    title: string;
    description: string;
    allDay: boolean;
}