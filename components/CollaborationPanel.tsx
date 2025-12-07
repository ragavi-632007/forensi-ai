import React, { useState, useEffect, useRef } from 'react';
import { TeamMessage, Officer, CaseData } from '../types';
import { MOCK_OFFICERS } from '../data';

interface CollaborationPanelProps {
  caseData: CaseData;
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string, id: string };
  messages: TeamMessage[];
  onSendMessage: (msg: TeamMessage) => void;
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ 
  caseData, 
  isOpen, 
  onClose,
  currentUser,
  messages,
  onSendMessage
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isOpen]);
  
  // Debug: Log messages when they change
  useEffect(() => {
    console.log("CollaborationPanel - Messages updated:", messages.length, messages);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMsg: TeamMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: input,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    onSendMessage(newMsg);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getSender = (id: string) => {
    if (id === currentUser.id) return { name: 'You', avatar: `https://ui-avatars.com/api/?name=${currentUser.name}&background=0D8ABC&color=fff` };
    if (id === 'system') return { name: 'SYSTEM', avatar: '' };
    const officer = MOCK_OFFICERS.find(o => o.id === id);
    return officer || { name: 'Unknown', avatar: '' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-80 lg:w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-[50] flex flex-col transform transition-transform duration-300 ease-in-out overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center shrink-0">
        <div className="min-w-0 flex-1">
           <h3 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
             <span className="truncate">Team Chat</span>
           </h3>
           <p className="text-[10px] sm:text-xs text-slate-400 truncate">Encrypted • {caseData.id}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 shrink-0 ml-2" aria-label="Close chat">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Active Officers */}
      <div className="p-2 sm:p-3 bg-slate-800/50 border-b border-slate-700 shrink-0">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 sm:mb-2">Online Officers</p>
        <div className="flex -space-x-2 overflow-x-auto">
          {MOCK_OFFICERS.filter(o => o.online).map(officer => (
            <img 
              key={officer.id}
              className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-slate-900 shrink-0" 
              src={officer.avatar} 
              alt={officer.name} 
              title={`${officer.name} - ${officer.role}`}
            />
          ))}
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-700 ring-2 ring-slate-900 flex items-center justify-center text-[10px] sm:text-xs text-white font-medium shrink-0">
            +1
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet</p>
              <p className="text-xs mt-1">Start the conversation</p>
            </div>
          </div>
        ) : (
          [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isSystem = msg.type === 'alert';
          const sender = getSender(msg.senderId);

          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-2">
                 <span className="px-3 py-1 bg-amber-900/20 text-amber-500 text-xs rounded-full border border-amber-900/50 flex items-center gap-1">
                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   {msg.content}
                 </span>
               </div>
             );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                 <div className="flex items-center gap-2 mb-1">
                    {!isMe && <span className="text-xs text-slate-400 font-medium">{sender.name}</span>}
                    <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </div>
                 <div className={`p-3 rounded-lg text-sm shadow-sm ${
                   isMe 
                   ? 'bg-cyan-600 text-white rounded-tr-none' 
                   : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
                 }`}>
                   {msg.type === 'file' ? (
                     <div className="flex items-center gap-2">
                       <div className="p-2 bg-slate-900/30 rounded">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </div>
                       <div>
                         <p className="font-medium truncate max-w-[120px]">{msg.fileName}</p>
                         <p className="text-xs opacity-70">Shared File</p>
                       </div>
                     </div>
                   ) : (
                     msg.content
                   )}
                 </div>
              </div>
            </div>
          );
        }))
        }
      </div>

      {/* Input */}
      <div className="p-2 sm:p-3 bg-slate-800 border-t border-slate-700 shrink-0">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-md pl-2.5 sm:pl-3 pr-9 sm:pr-10 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-slate-500"
            placeholder="Secure message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={handleSend}
            className="absolute right-1 sm:right-1.5 top-1 sm:top-1.5 p-1 text-cyan-500 hover:text-white hover:bg-cyan-600 rounded transition-colors"
            aria-label="Send message"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-1.5 sm:mt-2 px-1">
           <button className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5" title="Attach Evidence" aria-label="Attach file">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
           </button>
           <span className="text-[9px] sm:text-[10px] text-slate-600 font-mono">E2E ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;