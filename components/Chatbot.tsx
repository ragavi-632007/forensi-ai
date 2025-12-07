import React, { useState, useRef, useEffect } from 'react';
import { CaseData, ChatMessage } from '../types';
import { analyzeCase } from '../services/geminiService';
import { fetchAIChatHistory, saveAIChatMessage } from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface ChatbotProps {
  data: CaseData;
}

const Chatbot: React.FC<ChatbotProps> = ({ data }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load History on Mount
  useEffect(() => {
    const loadHistory = async () => {
      if (isSupabaseConfigured()) {
        const history = await fetchAIChatHistory(data.id);
        if (history.length > 0) {
          setMessages(history);
        } else {
          // Default greeting if no history
          setMessages([{ 
            id: 'init', 
            role: 'model', 
            text: 'ForensiAI Insight Engine online. History is being recorded.', 
            timestamp: Date.now() 
          }]);
        }
      } else {
         setMessages([{ 
            id: 'init', 
            role: 'model', 
            text: 'ForensiAI Insight Engine online (Local Mode).', 
            timestamp: Date.now() 
          }]);
      }
    };
    loadHistory();
  }, [data.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Save User Msg
    if(isSupabaseConfigured()) {
      try {
        await saveAIChatMessage(data.id, userMsg);
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }

    try {
      const responseText = await analyzeCase(data, input);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // Save AI Msg
      if(isSupabaseConfigured()) {
        try {
          await saveAIChatMessage(data.id, aiMsg);
        } catch (error) {
          console.error('Failed to save AI message:', error);
        }
      }

    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'System Error: Unable to query AI Insight Engine.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-slate-850 rounded-lg border border-slate-700 shadow-xl h-[calc(100vh-8rem)] sm:h-[500px] md:h-[600px] flex flex-col">
      <div className="p-3 sm:p-4 border-b border-slate-700 bg-slate-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-cyan-400 font-semibold tracking-wide flex items-center gap-2 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          AI INSIGHT ENGINE
        </h3>
        <span className="text-[10px] sm:text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded border border-cyan-900">RAG ACTIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
            }`}>
              {msg.role === 'model' ? (
                // Simple markdown rendering for AI response
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-700 rounded-lg p-3 text-sm text-cyan-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></span>
              Analyzing UFDR data...
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-md pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-500"
            placeholder="Ask about chats, anomalies, or entities..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={handleSend}
            disabled={isThinking}
            className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors disabled:opacity-50"
            aria-label="Send message"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;