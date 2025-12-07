import React, { useState, useEffect } from 'react';
import { ViewState, CaseData, TeamMessage, CaseComment, Officer } from './types';
import { MOCK_CASE_DATA, MOCK_GRAPH_DATA, MOCK_OFFICERS } from './data';
import Dashboard from './components/Dashboard';
import Timeline from './components/Timeline';
import GraphViewer from './components/GraphViewer';
import MapViewer from './components/MapViewer';
import MediaGallery from './components/MediaGallery';
import Chatbot from './components/Chatbot';
import CollaborationPanel from './components/CollaborationPanel';
import { generateCaseReport } from './services/geminiService';
import { exportToJson, exportToCsv } from './services/exportService';
import { parseZipFile } from './services/fileService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { authenticateOfficer, fetchFullCase, persistCase, fetchAllCases, deleteCaseFromDb, logActivity, updateMediaComments, saveAIInsight } from './services/supabaseService';

function App() {
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [secureToken, setSecureToken] = useState('');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [report, setReport] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [savedCases, setSavedCases] = useState<any[]>([]);
  const [newCaseName, setNewCaseName] = useState('');
  
  // Collaboration State
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<Officer>({ id: 'u1', name: 'Det. Miller', role: 'Investigator', avatar: '', online: true });
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Auth Handlers ---
  const handleLogin = async () => {
    if (!username.trim() || !secureToken.trim()) {
      alert("Please enter Badge ID and Secure Token.");
      return;
    }

    if (isSupabaseConfigured()) {
       const officer = await authenticateOfficer(username, secureToken);
       if (officer) {
         setCurrentUser(officer);
         setIsAuthenticated(true);
         setView(ViewState.UPLOAD);
         loadSavedCasesList();
       } else {
         alert("Authentication Failed. Invalid Badge ID or Token.");
       }
    } else {
      // Fallback for demo without backend
      if (secureToken === 'demo') {
        setIsAuthenticated(true);
        setView(ViewState.UPLOAD);
      } else {
        alert("Enter 'demo' as token for offline mode, or configure Supabase.");
      }
    }
  };

  const loadSavedCasesList = async () => {
    if (isSupabaseConfigured()) {
      const cases = await fetchAllCases();
      setSavedCases(cases);
    }
  };

  useEffect(() => {
    if (view === ViewState.UPLOAD && isSupabaseConfigured()) {
      loadSavedCasesList();
    }
  }, [view]);

  // Real-time Team Chat Subscription
  useEffect(() => {
    if (!isAuthenticated || !caseData || !isSupabaseConfigured() || !supabase) return;

    const channel = supabase
      .channel('public:team_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'team_messages',
        filter: `case_id=eq.${caseData.id}` 
      }, (payload) => {
        const newMsg = payload.new as any;
        const formattedMsg: TeamMessage = {
          id: newMsg.id,
          senderId: newMsg.sender_id,
          content: newMsg.content,
          timestamp: newMsg.timestamp,
          type: newMsg.type,
          fileName: newMsg.file_name
        };
        // Prevent duplicates - only add if message doesn't already exist
        setTeamMessages((prev) => {
          const exists = prev.some(m => m.id === formattedMsg.id);
          if (exists) return prev; // Message already added optimistically
          return [...prev, formattedMsg];
        });
        if (!isChatPanelOpen) setHasUnreadMessages(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, caseData?.id, isChatPanelOpen]);

  // Handle Real File Upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      let extractedMedia = [];
      if (file.name.endsWith('.zip') || file.type.includes('zip')) {
         extractedMedia = await parseZipFile(file);
      }

      const timestamp = new Date();
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const finalName = newCaseName.trim() || `Case: ${file.name}`;

      const mediaToUse = extractedMedia.length > 0 ? extractedMedia : MOCK_CASE_DATA.media;

      const newCase: CaseData = {
        ...MOCK_CASE_DATA,
        id: `CASE-${timestamp.getFullYear()}-${randomId}`,
        name: finalName,
        extractionDate: timestamp.toISOString(),
        media: mediaToUse,
        teamMessages: [],
        activityLog: []
      };

      if (isSupabaseConfigured()) {
        await persistCase(newCase, currentUser.id);
        await logActivity(newCase.id, {
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: "Imported UFDR",
          target: file.name,
          timestamp: new Date().toISOString(),
          type: "system"
        });
      }
      
      setCaseData(newCase);
      setTeamMessages([]);
      
      setTimeout(() => {
        setIsProcessing(false);
        setView(ViewState.DASHBOARD);
        setNewCaseName('');
      }, 500);

    } catch (error) {
      console.error("Upload failed", error);
      alert("Error processing file. See console.");
      setIsProcessing(false);
    }
  };

  const handleLoadCase = async (partialCase: any) => {
    if (isSupabaseConfigured()) {
      setIsProcessing(true);
      const fullCase = await fetchFullCase(partialCase.id);
      setIsProcessing(false);
      
      if (fullCase) {
        // Check and fix any invalid blob URLs in media
        const fixedMedia = fullCase.media.map(m => {
          // If URL is a blob URL (starts with blob:), it's invalid after reload
          // In this case, we'd need to re-extract or use a placeholder
          // For now, we'll keep it as is and let the error handler show a placeholder
          if (m.url && m.url.startsWith('blob:')) {
            console.warn(`Invalid blob URL detected for ${m.fileName}. Blob URLs don't persist after page reload.`);
          }
          return m;
        });
        
        setCaseData({ ...fullCase, media: fixedMedia });
        setTeamMessages(fullCase.teamMessages || []);
        setView(ViewState.DASHBOARD);
        
        await logActivity(fullCase.id, {
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          action: "Opened Case",
          target: fullCase.name,
          timestamp: new Date().toISOString(),
          type: "access"
        });
      } else {
        alert("Failed to load case data.");
      }
    } else {
      // Mock Fallback
      setCaseData(MOCK_CASE_DATA);
      setView(ViewState.DASHBOARD);
    }
  };

  const handleDeleteCase = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("Are you sure you want to delete this case and all evidence?")) {
      if (isSupabaseConfigured()) {
        await deleteCaseFromDb(id);
        loadSavedCasesList();
      }
    }
  };

  const handleGenerateReport = async () => {
    if (!caseData) return;
    setLoadingReport(true);
    setView(ViewState.REPORT);
    const result = await generateCaseReport(caseData);
    setReport(result);
    setLoadingReport(false);
    
    if (isSupabaseConfigured()) {
      // Save AI insight/report to Supabase
      await saveAIInsight(caseData.id, {
        id: `insight-${Date.now()}`,
        type: 'report',
        title: `AI Case Report - ${caseData.name}`,
        content: result,
        generatedBy: currentUser.id,
        timestamp: new Date().toISOString()
      });
      
      // Log activity
      await logActivity(caseData.id, {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        action: "Generated Report",
        target: "AI Summary",
        timestamp: new Date().toISOString(),
        type: "system"
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView(ViewState.LOGIN);
    setCaseData(null);
    setSecureToken('');
    setUsername('');
  }

  // Handle sending a message
  const handleSendMessage = async (msg: TeamMessage) => {
    console.log("Sending message:", msg);
    
    // Optimistic update: Add message to UI immediately
    setTeamMessages(prev => {
      const updated = [...prev, msg];
      console.log("Updated teamMessages:", updated);
      return updated;
    });
    
    // Then save to Supabase in the background
    if (isSupabaseConfigured() && supabase && caseData) {
      try {
        const { error } = await supabase
          .from('team_messages')
          .insert([{
            id: msg.id,
            case_id: caseData.id,
            sender_id: msg.senderId,
            content: msg.content,
            timestamp: msg.timestamp,
            type: msg.type,
            file_name: msg.fileName
          }]);
        
        if (error) {
          console.error("Error sending message:", error);
        } else {
          console.log("Message saved to Supabase successfully");
        }
      } catch (error) {
        console.error("Failed to save message:", error);
      }
    } else {
      console.log("Supabase not configured, using local storage only");
    }
  };

  // Handle adding a comment
  const handleAddComment = (evidenceId: string, content: string) => {
    if (!caseData) return;
    
    const newComment: CaseComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      timestamp: new Date().toISOString(),
      evidenceId
    };

    const updatedMedia = caseData.media.map(m => {
      if (m.id === evidenceId) {
        const updatedComments = [...(m.comments || []), newComment];
        
        // Persist to Supabase if configured
        if (isSupabaseConfigured()) {
           updateMediaComments(evidenceId, updatedComments);
        }

        return { ...m, comments: updatedComments };
      }
      return m;
    });

    setCaseData({ ...caseData, media: updatedMedia });
  };

  const toggleChat = () => {
    setIsChatPanelOpen(!isChatPanelOpen);
    if (!isChatPanelOpen) setHasUnreadMessages(false);
  };

  // --- Renderers ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-8 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
               <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">ForensiAI</h1>
          <p className="text-center text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Secure UFDR Analysis Platform</p>
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Badge ID</label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-600 rounded p-2.5 sm:p-2 text-sm sm:text-base text-white focus:border-cyan-500 outline-none placeholder-slate-600" 
                placeholder="e.g. miller.j" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Secure Token</label>
              <input 
                type="password" 
                className="w-full bg-slate-800 border border-slate-600 rounded p-2.5 sm:p-2 text-sm sm:text-base text-white focus:border-cyan-500 outline-none placeholder-slate-600" 
                placeholder="••••••••" 
                value={secureToken}
                onChange={(e) => setSecureToken(e.target.value)}
              />
            </div>
            <button onClick={handleLogin} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 sm:py-2 px-4 rounded transition-all shadow-lg shadow-cyan-900/20 text-sm sm:text-base">
              AUTHENTICATE
            </button>
            <p className="text-xs text-center text-slate-600 mt-3 sm:mt-4">Restricted System. Authorized Personnel Only.</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === ViewState.UPLOAD) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-center">Case Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 w-full max-w-6xl">
          
          {/* Ingest Section */}
          <div className="bg-slate-800 p-4 sm:p-8 rounded-xl border-2 border-dashed border-slate-600 text-center flex flex-col justify-center items-center hover:border-cyan-500/50 transition-colors group relative">
            
            {isProcessing ? (
               <div className="absolute inset-0 bg-slate-800/90 z-20 flex flex-col items-center justify-center rounded-xl">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
                 <p className="text-cyan-400 font-semibold">Syncing to Cloud Database...</p>
                 <p className="text-xs text-slate-500 mt-2">Uploading Evidence Records</p>
               </div>
            ) : null}

            <div className="mb-6 p-4 bg-slate-900 rounded-full group-hover:bg-slate-700 transition-colors">
              <svg className="w-12 h-12 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">Ingest New UFDR</h3>
            <p className="text-slate-400 mb-4 sm:mb-6 text-xs sm:text-sm max-w-xs mx-auto">Upload extraction (ZIP/UFDR). System will parse and sync to Supabase.</p>
            
            <div className="mb-4 w-full max-w-xs">
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white focus:border-cyan-500 outline-none text-sm placeholder-slate-500"
                placeholder="Case Name (Optional)"
                value={newCaseName}
                onChange={(e) => setNewCaseName(e.target.value)}
              />
            </div>

            <label className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-3 rounded-lg cursor-pointer transition-all shadow-lg shadow-cyan-900/20 font-semibold">
               <span>Select Evidence ZIP</span>
               <input type="file" className="hidden" onChange={handleUpload} accept=".zip,.ufdr,application/zip" />
            </label>
            <div className="mt-6 pt-4 border-t border-slate-700 w-full">
              <p className="text-xs text-slate-500">Supported formats: .zip, .ufdr</p>
            </div>
          </div>

          {/* Saved Cases Section */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden shadow-2xl h-[400px] sm:h-[500px]">
            <div className="p-4 bg-slate-900/80 border-b border-slate-700 flex justify-between items-center backdrop-blur">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Remote Database
              </h3>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{savedCases.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                   <p className="text-sm">No cases in database.</p>
                </div>
              ) : (
                savedCases.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => handleLoadCase(c)}
                    className="p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-cyan-500/50 cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{c.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-1">{c.id}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(c.extraction_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => handleDeleteCase(e, c.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Dashboard Layout ---
  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 overflow-x-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Sidebar Navigation */}
      <div className={`fixed lg:static inset-y-0 left-0 w-64 sm:w-72 bg-slate-900 border-r border-slate-700 flex flex-col shrink-0 transition-transform duration-300 z-50 lg:z-auto ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shrink-0">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <span className="font-bold text-lg text-white tracking-wide">ForensiAI</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {[
            { id: ViewState.DASHBOARD, label: 'Dashboard', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
            { id: ViewState.TIMELINE, label: 'Timeline', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            { id: ViewState.GRAPH, label: 'Link Graph', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> },
            { id: ViewState.MAP, label: 'Geo Map', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7" /></svg> },
            { id: ViewState.MEDIA, label: 'Media Gallery', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
            { id: ViewState.CHAT, label: 'AI Insight', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
            { id: ViewState.REPORT, label: 'Report', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> }
          ].map((item) => (
             <button
               key={item.id}
               onClick={() => {
                 setView(item.id);
                 setIsMobileMenuOpen(false); // Close mobile menu on navigation
               }}
               className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                 view === item.id 
                 ? 'bg-slate-800 text-cyan-400 border-r-2 border-cyan-400' 
                 : 'text-slate-400 hover:bg-slate-800 hover:text-white'
               }`}
             >
               <item.icon className="w-5 h-5 shrink-0" />
               <span className="font-medium text-sm">{item.label}</span>
             </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
           <button 
             onClick={() => {
               setView(ViewState.UPLOAD);
               setIsMobileMenuOpen(false);
             }} 
             className="w-full flex items-center gap-3 text-slate-400 hover:text-white transition-colors mb-4"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              <span className="text-sm">Switch Case</span>
           </button>
           <button 
             onClick={() => {
               handleLogout();
               setIsMobileMenuOpen(false);
             }} 
             className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span className="text-sm">Logout</span>
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        
        {/* Top Header */}
        <header className="h-14 sm:h-16 bg-slate-900 border-b border-slate-700 flex justify-between items-center px-3 sm:px-4 md:px-6 shrink-0 z-20">
           <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 text-slate-400 hover:text-white mr-1 sm:mr-2"
                aria-label="Open menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 min-w-0 flex-1">
                <h2 className="text-sm sm:text-base md:text-xl font-bold text-white tracking-wide truncate">{caseData?.name}</h2>
                <span className="hidden sm:inline-block px-1.5 sm:px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] sm:text-xs rounded border border-slate-700 font-mono whitespace-nowrap truncate max-w-[120px] md:max-w-none">{caseData?.id}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
              {/* Export Dropdown for Mobile */}
              <div className="relative sm:hidden">
                <button 
                  onClick={(e) => {
                    const menu = e.currentTarget.nextElementSibling;
                    if (menu) {
                      (menu as HTMLElement).classList.toggle('hidden');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-white"
                  aria-label="Export options"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </button>
                <div className="hidden absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-30 min-w-[120px]">
                  <button onClick={() => exportToJson(caseData!)} className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-700 rounded-t-lg">Export JSON</button>
                  <button onClick={() => exportToCsv(caseData!)} className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-700 rounded-b-lg">Export CSV</button>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-2">
                 <button onClick={() => exportToJson(caseData!)} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 sm:px-3 py-1.5 rounded border border-slate-600 transition-colors whitespace-nowrap">Export JSON</button>
                 <button onClick={() => exportToCsv(caseData!)} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-2 sm:px-3 py-1.5 rounded border border-slate-600 transition-colors whitespace-nowrap">Export CSV</button>
              </div>
              
              <div className="hidden sm:block w-px h-6 bg-slate-700"></div>

              {/* Chat Toggle Button */}
              {secureToken ? (
                  <button 
                    onClick={toggleChat}
                    className={`relative p-1.5 sm:p-2 rounded-full transition-colors ${isChatPanelOpen ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    title="Secure Officer Chat"
                    aria-label="Toggle team chat"
                  >
                     <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                     {hasUnreadMessages && (
                       <span className="absolute top-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                     )}
                  </button>
              ) : (
                  <button 
                    disabled 
                    className="p-1.5 sm:p-2 rounded-full text-slate-700 cursor-not-allowed" 
                    title="Chat requires Secure Token"
                    aria-label="Chat disabled"
                  >
                     <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </button>
              )}

              <div className="flex items-center gap-1.5 sm:gap-2">
                 <img src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=0D8ABC&color=fff`} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-600 shrink-0" alt={currentUser.name} />
                 <div className="hidden md:block">
                    <p className="text-xs font-bold text-white truncate max-w-[100px]">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500">Online</p>
                 </div>
              </div>
           </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 relative">
          {view === ViewState.DASHBOARD && <Dashboard data={caseData!} />}
          {view === ViewState.TIMELINE && <Timeline data={caseData!} />}
          {view === ViewState.GRAPH && <GraphViewer data={MOCK_GRAPH_DATA} />}
          {view === ViewState.MAP && <MapViewer locations={caseData!.locations} />}
          {view === ViewState.MEDIA && (
             <MediaGallery 
               media={caseData!.media} 
               currentUser={currentUser}
               onAddComment={handleAddComment}
             />
          )}
          {view === ViewState.CHAT && <Chatbot data={caseData!} />}
          
          {view === ViewState.REPORT && (
            <div className="bg-slate-850 rounded-lg border border-slate-700 shadow-xl p-4 sm:p-6 md:p-8 max-w-4xl mx-auto min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 border-b border-slate-700 pb-3 sm:pb-4">
                 <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-cyan-400">Forensic Case Summary</h2>
                 <button 
                   onClick={handleGenerateReport} 
                   disabled={loadingReport}
                   className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white px-3 sm:px-4 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm md:text-base whitespace-nowrap"
                 >
                   {loadingReport ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       Generating...
                     </>
                   ) : (
                     <>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                       Regenerate AI Report
                     </>
                   )}
                 </button>
              </div>
              <div className="prose prose-invert max-w-none">
                 {report ? (
                   <div dangerouslySetInnerHTML={{ __html: report.replace(/\n/g, '<br/>').replace(/## (.*)/g, '<h3 class="text-xl font-bold text-white mt-4 mb-2">$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-200">$1</strong>') }} />
                 ) : (
                   <div className="text-center py-20 text-slate-500">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p>Click regenerate to create a new AI-powered case summary.</p>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* Collaboration Panel Overlay */}
          <div className={`fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out w-full sm:w-80 ${isChatPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <CollaborationPanel 
               caseData={caseData!} 
               isOpen={isChatPanelOpen} 
               onClose={() => setIsChatPanelOpen(false)}
               currentUser={currentUser}
               messages={teamMessages}
               onSendMessage={handleSendMessage}
             />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;