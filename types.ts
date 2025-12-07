export enum ViewState {
  LOGIN = 'LOGIN',
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  TIMELINE = 'TIMELINE',
  GRAPH = 'GRAPH',
  MAP = 'MAP',
  MEDIA = 'MEDIA',
  CHAT = 'CHAT',
  REPORT = 'REPORT'
}

export interface User {
  id: string;
  name: string;
  role: 'investigator' | 'admin';
}

export interface Officer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  online: boolean;
}

export interface TeamMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'alert';
  fileName?: string; // If type is file
}

export interface CaseComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  evidenceId: string; // ID of the media or call record
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'access' | 'edit' | 'flag' | 'system';
}

export interface CallRecord {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  duration: number; // seconds
  type: 'incoming' | 'outgoing' | 'missed';
}

export interface MessageRecord {
  id: string;
  timestamp: string;
  from: string;
  to: string;
  content: string;
  app: 'whatsapp' | 'sms' | 'telegram';
}

export interface LocationRecord {
  id: string;
  timestamp: string;
  lat: number;
  lng: number;
  label: string;
}

export interface MediaRecord {
  id: string;
  timestamp: string;
  type: 'image' | 'video' | 'audio';
  fileName: string;
  url: string;
  size: string;
  mimeType?: string;
  metadata?: {
    dimensions?: string;
    duration?: string;
    device?: string;
    location?: string;
    aperture?: string;
    iso?: string;
    shutterSpeed?: string;
    focalLength?: string;
    codec?: string;
  };
  comments?: CaseComment[]; // Attached comments
}

export interface CaseData {
  id: string;
  name: string;
  device: string;
  extractionDate: string;
  owner: string;
  calls: CallRecord[];
  messages: MessageRecord[];
  locations: LocationRecord[];
  media: MediaRecord[];
  teamMessages?: TeamMessage[]; // Chat history for this case
  activityLog?: ActivityLog[]; // Audit trail
}

export interface GraphNode {
  id: string;
  group: number; // 1: Target, 2: Contact, 3: Location
  val: number; // Size/Importance
}

export interface GraphLink {
  source: string;
  target: string;
  value: number; // Strength of connection
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}