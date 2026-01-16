
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { AnalysisState, ChatMessage } from './types';
import { SCORING_WEIGHTS } from './constants';
import ScoreCard from './components/ScoreCard';
import FileUpload from './components/FileUpload';
import ResumePreview from './components/ResumePreview';

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const gemini = useRef(new GeminiService());
  const chatSession = useRef<any>(null);

  useEffect(() => {
    chatSession.current = gemini.current.createChatSession();
  }, []);

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !resumeFile) {
      setState(prev => ({ ...prev, error: "First, add your resume." }));
      return;
    }
    setState({ isAnalyzing: true, result: null, error: null });
    try {
      const result = await gemini.current.analyzeResume(
        resumeText, 
        jdText, 
        resumeFile ? { data: resumeFile.data, mimeType: resumeFile.mimeType } : undefined
      );
      setState({ isAnalyzing: false, result, error: null });
    } catch (err: any) {
      setState({ isAnalyzing: false, result: null, error: err.message });
    }
  };

  const onChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    try {
      const response = await chatSession.current.sendMessage({ message: msg });
      setChatMessages(prev => [...prev, { role: 'model', text: response.text }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditImage = async () => {
    if (!resumeFile || !resumeFile.mimeType.startsWith('image/') || !editPrompt.trim()) return;
    setIsEditingImage(true);
    try {
      const result = await gemini.current.editImage(resumeFile.data, resumeFile.mimeType, editPrompt);
      setEditedImage(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditingImage(false);
    }
  };

  const getExplanationSummary = () => {
    const text = state.result?.explanation || "Analysis complete.";
    return text.split('.')[0] + '.';
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-stone-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Smooth Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Simplified Nav */}
      <nav className="sticky top-0 z-[100] h-20 bg-white/80 backdrop-blur-xl border-b border-stone-200/50 px-8 lg:px-16 flex items-center justify-between transition-all duration-500">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform">
            <i className="fa-solid fa-bolt text-emerald-400"></i>
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Zenith</h1>
        </div>
        <div className="flex items-center space-x-6">
           <button onClick={() => window.location.reload()} className="text-[10px] font-black text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors">Clear</button>
           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-16 lg:py-24">
        
        {/* Simple Hero */}
        <header className="mb-24 text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h2 className="text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.9]">
            Build Your <br/> <span className="text-emerald-600">Dream</span> Future.
          </h2>
          <p className="text-lg text-stone-400 font-medium max-w-xl mx-auto">
            A simple tool that reads your resume like a pro recruiter. Simple scores. Easy steps. Big results.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Action Dashboard */}
          <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-left duration-700">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-200/60 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Step 1 / Your Resume</p>
                  <FileUpload 
                    label="Drop your file here" 
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    onFileSelect={(file, base64) => {
                      if (file && base64) setResumeFile({ name: file.name, data: base64, mimeType: file.type });
                      else setResumeFile(null);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Step 2 / Target Job</p>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-32 p-6 rounded-3xl bg-stone-50 border-stone-100 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={state.isAnalyzing}
                  className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 ${
                    state.isAnalyzing ? 'bg-stone-300' : 'bg-stone-900 hover:bg-emerald-600'
                  }`}
                >
                  {state.isAnalyzing ? "Analyzing..." : "Check My Resume"}
                </button>
              </div>
            </div>

            {/* Support Chat */}
            <div className="bg-stone-900 rounded-[2.5rem] p-8 h-[450px] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-1000">
               <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Career Guide</h3>
               </div>
               <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide">
                 {chatMessages.length === 0 && (
                   <p className="text-stone-500 text-xs font-bold italic">Ask me anything about your career.</p>
                 )}
                 {chatMessages.map((m, i) => (
                   <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-[11px] font-bold leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300'}`}>
                        {m.text}
                      </div>
                   </div>
                 ))}
               </div>
               <form onSubmit={onChatSubmit} className="flex gap-2">
                  <input 
                    value={chatInput} 
                    onChange={e => setChatInput(e.target.value)} 
                    placeholder="Type a message..." 
                    className="flex-1 bg-stone-800 border-none rounded-2xl px-5 py-3 text-xs font-bold text-white outline-none placeholder:text-stone-600" 
                  />
                  <button className="w-12 h-12 bg-emerald-600 text-white rounded-2xl hover:bg-white hover:text-emerald-600 transition-all flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
               </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7 space-y-12">
            {!state.result && !state.isAnalyzing && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border border-stone-100 shadow-sm animate-in zoom-in duration-700">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                  <i className="fa-solid fa-file-invoice text-2xl text-stone-200"></i>
                </div>
                <h3 className="text-xl font-black italic uppercase text-stone-300">Awaiting Input</h3>
              </div>
            )}

            {state.isAnalyzing && (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] animate-in fade-in duration-500">
                <div className="w-16 h-16 border-4 border-stone-100 border-t-emerald-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-lg font-black italic uppercase text-stone-900">Thinking...</h3>
              </div>
            )}

            {state.result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Visual Preview */}
                <div className="h-[400px] shadow-sm rounded-[2.5rem] overflow-hidden">
                  <ResumePreview file={resumeFile} text={resumeText} />
                </div>

                {/* Main Score Hero */}
                <div className="bg-white p-10 lg:p-14 rounded-[3rem] shadow-sm border border-stone-100 group">
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative">
                      <svg className="w-48 h-48 drop-shadow-xl">
                        <circle className="text-stone-50" strokeWidth="12" stroke="currentColor" fill="transparent" r="80" cx="96" cy="96" />
                        <circle 
                          className="text-emerald-600 transition-all duration-[2000ms] ease-out" 
                          strokeWidth="12" 
                          strokeDasharray={502} 
                          strokeDashoffset={502 - (502 * (state.result.scores?.finalAtsScore || 0)) / 100} 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                          r="80" cx="96" cy="96" 
                          transform="rotate(-90 96 96)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-black italic tracking-tighter leading-none">{Math.round(state.result.scores?.finalAtsScore || 0)}</span>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">Match %</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                      <h3 className="text-3xl lg:text-4xl font-black italic tracking-tighter leading-none uppercase">The Verdict.</h3>
                      <p className="text-stone-400 text-lg font-bold italic leading-relaxed">
                        {getExplanationSummary()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                    <ScoreCard id="readabilityScore" label="Reading" score={state.result.scores?.readabilityScore} color="text-stone-900" />
                    <ScoreCard id="impactScore" label="Impact" score={state.result.scores?.impactScore} color="text-emerald-600" />
                    <ScoreCard id="formattingScore" label="Cleanliness" score={state.result.scores?.formattingScore} color="text-amber-600" />
                    <ScoreCard id="keywordMatch" label="Matching" score={state.result.scores?.keywordMatch} color="text-orange-600" />
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100">
                      <ScoreCard id="experienceScore" label="Experience Level" score={state.result.scores?.experienceScore} weight={SCORING_WEIGHTS.EXPERIENCE} color="text-emerald-800" />
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100">
                      <ScoreCard id="semanticSimilarity" label="Deep Relevance" score={state.result.scores?.semanticSimilarity} weight={SCORING_WEIGHTS.SEMANTIC} color="text-amber-800" />
                   </div>
                </div>

                {/* Simple Tips */}
                <div className="bg-stone-900 p-10 lg:p-14 rounded-[3rem] text-white">
                   <h3 className="text-2xl font-black italic mb-8 uppercase tracking-tighter">Improvement Plan.</h3>
                   <ul className="space-y-6">
                      {state.result.details?.improvementSuggestions.slice(0, 3).map((s, idx) => (
                        <li key={idx} className="flex items-start space-x-4 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 200}ms` }}>
                          <i className="fa-solid fa-chevron-right text-emerald-400 mt-1.5 text-xs"></i>
                          <span className="text-stone-400 font-bold italic">{s}</span>
                        </li>
                      ))}
                   </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.5em]">
        Zenith &bull; Simple Career AI
      </footer>
    </div>
  );
};

export default App;
