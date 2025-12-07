import { CaseData, GraphData, MediaRecord, Officer, TeamMessage, ActivityLog } from './types';

// Mock Officers
export const MOCK_OFFICERS: Officer[] = [
  { id: "u1", name: "Det. Miller", role: "Lead Investigator", avatar: "https://ui-avatars.com/api/?name=Det+Miller&background=0D8ABC&color=fff", online: true },
  { id: "u2", name: "Sarah Chen", role: "Forensic Analyst", avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=E11D48&color=fff", online: true },
  { id: "u3", name: "Capt. Price", role: "Unit Commander", avatar: "https://ui-avatars.com/api/?name=Capt+Price&background=059669&color=fff", online: false },
];

// Mock Team Messages
export const MOCK_TEAM_MESSAGES: TeamMessage[] = [
  { id: "tm1", senderId: "u2", content: "I've uploaded the raw UFDR extraction. Timestamps normalized to UTC.", timestamp: "2024-05-21T09:15:00Z", type: "text" },
  { id: "tm2", senderId: "u1", content: "Copy that. I'm seeing a lot of encrypted traffic on Telegram.", timestamp: "2024-05-21T09:18:00Z", type: "text" },
  { id: "tm3", senderId: "u2", content: "Suspicious_Transaction_Log.pdf", timestamp: "2024-05-21T09:25:00Z", type: "file", fileName: "Suspicious_Transaction_Log.pdf" },
  { id: "tm4", senderId: "system", content: "System Alert: Integrity hash verified for extraction container.", timestamp: "2024-05-21T09:00:00Z", type: "alert" },
];

// Mock Activity Log
export const MOCK_ACTIVITY_LOG: ActivityLog[] = [
  { id: "log1", userId: "u1", userName: "Det. Miller", action: "Viewed Evidence", target: "IMG_0023.jpg", timestamp: "2024-05-21T10:05:00Z", type: "access" },
  { id: "log2", userId: "u2", userName: "Sarah Chen", action: "Flagged Message", target: "WhatsApp thread ID #442", timestamp: "2024-05-21T09:45:00Z", type: "flag" },
  { id: "log3", userId: "u1", userName: "Det. Miller", action: "Generated Report", target: "Preliminary Summary", timestamp: "2024-05-21T11:30:00Z", type: "system" },
  { id: "log4", userId: "u3", userName: "Capt. Price", action: "Accessed Case", target: "Dashboard", timestamp: "2024-05-21T08:15:00Z", type: "access" },
];

// Helper to generate mock images that match the user's specific report structure (img_001 to img_030)
const generateMockReportImages = (): MediaRecord[] => {
  // Generate exactly 30 images as seen in the folder view
  return Array.from({ length: 30 }).map((_, i) => {
    const num = (i + 1).toString().padStart(3, '0'); // 001, 002, ... 030
    return {
      id: `img_${num}`,
      timestamp: new Date(2024, 4, 15, 10, i % 60).toISOString(),
      type: 'image',
      fileName: `img_${num}`, // Matches the exact filename format from screenshot
      url: `https://picsum.photos/seed/report_${num}/800/600`, // Random content, but specific consistent seed
      size: `${(1.2 + Math.random() * 2).toFixed(2)} MB`,
      mimeType: "image/jpeg",
      metadata: {
        dimensions: "1920x1080",
        device: "Samsung Galaxy S23",
        // Add random location data to some to populate the map
        location: i % 4 === 0 ? "34.0522, -118.2437" : undefined, 
      },
      comments: i === 2 ? [
        { id: "c1", userId: "u2", userName: "Sarah Chen", content: "This background matches the warehouse in the suspect's description.", timestamp: "2024-05-21T10:00:00Z", evidenceId: `img_${num}` }
      ] : []
    };
  });
};

// Simulating a parsed UFDR extraction
export const MOCK_CASE_DATA: CaseData = {
  id: "CASE-2024-001",
  name: "Operation: Skylight",
  device: "Samsung Galaxy S23 (SM-S911B)",
  extractionDate: "2024-05-20T09:00:00Z",
  owner: "John Doe (Suspect)",
  teamMessages: MOCK_TEAM_MESSAGES,
  activityLog: MOCK_ACTIVITY_LOG,
  calls: [
    { id: "c1", timestamp: "2024-05-15T10:30:00Z", from: "John Doe", to: "+15550101", duration: 120, type: "outgoing" },
    { id: "c2", timestamp: "2024-05-15T14:15:00Z", from: "+15550199", to: "John Doe", duration: 45, type: "incoming" },
    { id: "c3", timestamp: "2024-05-16T09:00:00Z", from: "John Doe", to: "+15550101", duration: 300, type: "outgoing" },
    { id: "c4", timestamp: "2024-05-16T18:45:00Z", from: "+15550123", to: "John Doe", duration: 0, type: "missed" },
    { id: "c5", timestamp: "2024-05-17T11:20:00Z", from: "John Doe", to: "+447700900", duration: 600, type: "outgoing" },
  ],
  messages: [
    { id: "m1", timestamp: "2024-05-15T10:35:00Z", from: "John Doe", to: "+15550101", content: "Did the package arrive?", app: "whatsapp" },
    { id: "m2", timestamp: "2024-05-15T10:36:00Z", from: "+15550101", to: "John Doe", content: "Yes, secure.", app: "whatsapp" },
    { id: "m3", timestamp: "2024-05-16T09:05:00Z", from: "John Doe", to: "+15550101", content: "Transfer initiated. Check the account.", app: "telegram" },
    { id: "m4", timestamp: "2024-05-17T11:30:00Z", from: "+447700900", to: "John Doe", content: "Meeting moved to 5 PM at the dock.", app: "sms" },
    { id: "m5", timestamp: "2024-05-17T16:50:00Z", from: "John Doe", to: "+447700900", content: "En route.", app: "sms" },
  ],
  locations: [
    { id: "l1", timestamp: "2024-05-15T10:00:00Z", lat: 34.0522, lng: -118.2437, label: "Home Base" },
    { id: "l2", timestamp: "2024-05-17T17:00:00Z", lat: 33.7405, lng: -118.2786, label: "San Pedro Docks" },
  ],
  media: [
    // Core specific evidence requested by user (img_001 to img_030)
    ...generateMockReportImages(),
    
    // Add a few explicit Video/Audio files for diversity as requested
    { 
      id: "media_vid_1", 
      timestamp: "2024-05-17T16:55:00Z", 
      type: "video", 
      fileName: "VID_Dashcam_Clip.mp4", 
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      size: "45.0 MB",
      mimeType: "video/mp4",
      metadata: { duration: "00:00:10", codec: "H.264" },
      comments: []
    },
    { 
      id: "media_aud_1", 
      timestamp: "2024-05-16T09:10:00Z", 
      type: "audio", 
      fileName: "AUD_VoiceNote_001.mp3", 
      url: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav", 
      size: "1.2 MB",
      mimeType: "audio/wav",
      metadata: { duration: "00:01:00" },
      comments: []
    }
  ]
};

// Derived graph data
export const MOCK_GRAPH_DATA: GraphData = {
  nodes: [
    { id: "John Doe", group: 1, val: 20 },
    { id: "+15550101", group: 2, val: 10 },
    { id: "+15550199", group: 2, val: 5 },
    { id: "+15550123", group: 2, val: 5 },
    { id: "+447700900", group: 2, val: 15 }, // High value target
    { id: "WhatsApp", group: 3, val: 8 },
    { id: "Telegram", group: 3, val: 8 },
  ],
  links: [
    { source: "John Doe", target: "+15550101", value: 5 },
    { source: "John Doe", target: "+15550199", value: 1 },
    { source: "John Doe", target: "+15550123", value: 1 },
    { source: "John Doe", target: "+447700900", value: 3 },
    { source: "+15550101", target: "WhatsApp", value: 2 },
    { source: "+15550101", target: "Telegram", value: 1 },
  ]
};