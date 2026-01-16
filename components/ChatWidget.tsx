
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AnalysisResult } from '../types';
import { GeminiService } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface ChatWidgetProps {
  geminiService: GeminiService;
  analysisContext: AnalysisResult | null;
  externalTrigger?: string | null;
  onTriggerConsumed?: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  // Filter out any accidental infinite repetitions from the model output
  const lines = text.split('\n').filter((line, index, self) => self.indexOf(line) === index);
  const filteredText = lines.join('\n');
  const paragraphs = filteredText.split('\n\n');

  return (
    <div className="space-y-4">
      {paragraphs.map((para, pIdx) => {
        if (!para.trim()) return null;

        // Process Tags
        if (para.includes('[WIN]')) {
          return (
            <div key={pIdx} className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-2xl shadow-sm">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1 flex items-center">
                <i className="fa-solid fa-circle-check mr-2"></i> STRENGTH
              </span>
              <FormattedTextInternal text={para.replace('[WIN]', '').trim()} />
            </div>
          );
        }
        if (para.includes('[GAP]')) {
          return (
            <div key={pIdx} className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-2xl shadow-sm">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-1 flex items-center">
                <i className="fa-solid fa-triangle-exclamation mr-2"></i> MISSING PIECE
              </span>
              <FormattedTextInternal text={para.replace('[GAP]', '').trim()} />
            </div>
          );
        }
        if (para.includes('[ACTION]')) {
          return (
            <div key={pIdx} className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-2xl shadow-sm">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1 flex items-center">
                <i className="fa-solid fa-bolt mr-2"></i> IMMEDIATE TASK
              </span>
              <FormattedTextInternal text={para.replace('[ACTION]', '').trim()} />
            </div>
          );
        }
        if (para.includes('[STRATEGY]')) {
          return (
            <div key={pIdx} className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-2xl shadow-sm">
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest block mb-1 flex items-center">
                <i className="fa-solid fa-map mr-2"></i> LONG TERM MOVE
              </span>
              <FormattedTextInternal text={para.replace('[STRATEGY]', '').trim()} />
            </div>
          );
        }

        return <div key={pIdx} className="leading-relaxed"><FormattedTextInternal text={para} /></div>;
      })}
    </div>
  );
};

const FormattedTextInternal: React.FC<{ text: string }> = ({ text }) => {
  let content: React.ReactNode[] = [text];

  // Bold
  content = content.flatMap(item => {
    if (typeof item !== 'string') return item;
    const parts = item.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => 
      part.startsWith('**') && part.endsWith('**') 
        ? <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong> 
        : part
    );
  });

  // Italic
  content = content.flatMap(item => {
    if (typeof item !== 'string') return item;
    const parts = item.split(/(\*.*?\*)/g);
    return parts.map((part, i) => 
      part.startsWith('*') && part.endsWith('*') 
        ? <em key={i} className="text-emerald-400 italic font-medium">{part.slice(1, -1)}</em> 
        : part
    );
  });

  return <>{content}</>;
};

export default function ChatWidget({ 
  geminiService, 
  analysisContext, 
  externalTrigger, 
  onTriggerConsumed,
  isOpen,
  setIsOpen 
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAnalysisId = useRef<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('zenith_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('zenith_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    chatSession.current = geminiService.createChatSession(analysisContext || undefined);
    
    if (analysisContext && JSON.stringify(analysisContext.scores) !== lastAnalysisId.current) {
      lastAnalysisId.current = JSON.stringify(analysisContext.scores);
      // Automatically send a request to analyze the new resume
      setTimeout(() => {
        handleSendMessage("Zenith, I've just uploaded my resume. Please give me an elite, high-level summary of my audit.", true);
      }, 500);
    }
  }, [analysisContext, geminiService]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (externalTrigger && isOpen && !isTyping) {
      handleSendMessage(externalTrigger);
      onTriggerConsumed?.();
    }
  }, [externalTrigger, isOpen, isTyping]);

  const handleSendMessage = async (text: string, silent = false) => {
    if (!text.trim() || isTyping || !chatSession.current) return;

    if (!silent) {
      setMessages(prev => [...prev, { role: 'user', text }]);
    }
    
    setIsTyping(true);

    try {
      const response: GenerateContentResponse = await chatSession.current.sendMessage({ message: text });
      const botMsg: ChatMessage = { role: 'model', text: response.text || "Service signal weak." };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Analysis node offline. Please retry." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Purge conversation intelligence?")) {
      setMessages([]);
      localStorage.removeItem('zenith_chat_history');
      lastAnalysisId.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    const val = input;
    setInput('');
    handleSendMessage(val);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:relative sm:mb-6 w-full h-full sm:w-96 sm:h-[600px] glass sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in slide-in-from-bottom-8 zoom-in duration-300">
          <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-black/60 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic">ZENITH ADVISOR</h3>
                <p className="text-[8px] font-bold text-emerald-500/70 uppercase">Ready to Assist</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={clearHistory} className="text-white/10 hover:text-orange-500 transition-colors">
                <i className="fa-solid fa-bolt-lightning text-xs"></i>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-lg sm:text-base"></i>
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide bg-black/40">
            {messages.length === 0 && (
              <div className="space-y-6 py-10 text-center sm:text-left">
                <div className="w-16 h-16 bg-emerald-600/10 rounded-3xl flex items-center justify-center mx-auto sm:mx-0 border border-emerald-500/20">
                   <i className="fa-solid fa-shield-halved text-emerald-500 text-2xl"></i>
                </div>
                <h2 className="text-3xl font-extrabold italic text-white font-syne uppercase tracking-tighter leading-none">Intelligence <br/><span className="text-emerald-500">Active.</span></h2>
                <p className="text-[9px] font-black italic text-stone-700 leading-relaxed uppercase tracking-[0.4em]">
                  Awaiting audit context...
                </p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                <div className={`max-w-[90%] px-6 py-4 rounded-3xl text-[11px] font-bold ${
                    m.role === 'user' 
                      ? 'bg-emerald-600 text-white shadow-xl italic rounded-br-none border border-white/10' 
                      : 'bg-white/[0.04] text-stone-200 border border-white/5 rounded-bl-none shadow-inner'
                  }`}
                >
                  {m.role === 'model' ? <FormattedText text={m.text} /> : m.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-6 py-3 rounded-2xl bg-white/5 text-[8px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse border border-white/5">
                  Analyzing...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-black/80 border-t border-white/5 flex gap-3 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isTyping}
              placeholder={isTyping ? "Zenith is responding..." : "Message Zenith..."}
              className={`flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none transition-all ${isTyping ? 'opacity-50 cursor-not-allowed' : 'focus:bg-white/[0.07] focus:border-emerald-500/20'}`}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping} 
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                !input.trim() || isTyping 
                  ? 'bg-white/5 text-white/10' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.8rem] flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 group relative ${
          isOpen ? 'bg-white text-black rotate-90' : 'bg-emerald-600 text-white'
        }`}
      >
        <div className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-headset'} text-xl relative z-10`}></i>
      </button>
    </div>
  );
}
