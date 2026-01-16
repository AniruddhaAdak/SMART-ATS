
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

// Fixed the export default issue by using a standard named function declaration.
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

  useEffect(() => {
    chatSession.current = geminiService.createChatSession(analysisContext || undefined);
  }, [analysisContext, geminiService]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (externalTrigger && isOpen) {
      handleSendMessage(externalTrigger);
      onTriggerConsumed?.();
    }
  }, [externalTrigger, isOpen]);

  const stripMarkdown = (text: string) => {
    return text.replace(/[#*`_~]/g, '').trim();
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping || !chatSession.current) return;

    setMessages(prev => [...prev, { role: 'user', text: text }]);
    setIsTyping(true);

    try {
      // Guidelines: Use chatSession.sendMessage and response.text property.
      const response: GenerateContentResponse = await chatSession.current.sendMessage({ message: text });
      const cleanText = stripMarkdown(response.text || "Signal lost.");
      setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Signal lost. Re-establishing connection with Zenith." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = input;
    setInput('');
    handleSendMessage(val);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
      {isOpen && (
        <div className="mb-6 w-80 md:w-96 h-[500px] md:h-[600px] glass rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/10 animate-in slide-in-from-bottom-8 zoom-in duration-500">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-white/50">Strategy Interface</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {messages.length === 0 && (
              <div className="space-y-6 py-10">
                <p className="text-3xl font-black italic text-white font-syne uppercase tracking-tighter leading-none">Command Center.</p>
                <p className="text-[11px] font-bold italic text-stone-500 leading-relaxed uppercase tracking-widest">
                  {analysisContext ? "Industrial audit context loaded. Ask me for optimization tactics." : "Initiate an audit to enable high-fidelity career consulting."}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] text-[11px] font-bold leading-relaxed italic ${m.role === 'user' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white/5 border border-white/5 text-stone-300 whitespace-pre-line'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="px-6 py-4 rounded-[1.5rem] bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 animate-pulse italic">
                  Synthesizing Response...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask Zenith..."
              className="flex-1 bg-white/[0.03] border-none rounded-2xl px-6 py-4 text-xs font-bold text-white outline-none placeholder:text-stone-700 focus:bg-white/[0.08] transition-all"
            />
            <button className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-500 transition-all shadow-xl active:scale-95 group">
              <i className="fa-solid fa-location-arrow text-sm group-hover:rotate-12 transition-transform"></i>
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-700 transform hover:scale-110 active:scale-90 ${isOpen ? 'bg-white -rotate-90 shadow-white/10' : 'bg-emerald-600 hover:bg-emerald-500 rotate-0 shadow-emerald-600/30'}`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark text-[#050505]' : 'fa-comment-dots text-white'} text-xl`}></i>
      </button>
    </div>
  );
}
