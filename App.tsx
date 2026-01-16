
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { AnalysisState } from './types';
import { SCORING_WEIGHTS, LOADING_MESSAGES } from './constants';
import ScoreCard from './components/ScoreCard';
import FileUpload from './components/FileUpload';
import ResumePreview from './components/ResumePreview';
import ChatWidget from './components/ChatWidget';

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const gemini = useRef(new GeminiService());

  useEffect(() => {
    let interval: any;
    if (state.isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [state.isAnalyzing]);

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !resumeFile) {
      setState(prev => ({ ...prev, error: "Supply credentials to initiate." }));
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

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#050505]">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vh] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-orange-500/5 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      {/* Navigation - Glass effect */}
      <nav className="sticky top-0 z-[100] h-20 border-b border-white/5 glass px-8 lg:px-24 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-all">
            <i className="fa-solid fa-crown text-[#050505] text-sm"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold italic tracking-tighter uppercase leading-none text-white">ZENITH <span className="text-emerald-500">ELITE</span></h1>
            <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em] mt-1.5 font-syne italic">Protocol Active</p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-12">
           <button onClick={() => window.location.reload()} className="text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-all italic underline underline-offset-8 decoration-emerald-500/50">Restart Scan</button>
           <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
             <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Quantum Ready</span>
           </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        
        {/* Designer Hero */}
        <header className="max-w-4xl mb-24 space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <h2 className="text-6xl lg:text-9xl font-extrabold italic tracking-tighter uppercase leading-[0.85] text-white font-syne">
            The Future <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-500 animate-gradient">Of Work.</span>
          </h2>
          <p className="text-lg lg:text-2xl text-stone-400 font-medium max-w-2xl italic leading-relaxed">
            Autonomous career quantification. Precision-engineered gap analysis for the top 1%. 
            <span className="text-emerald-500"> Powered by Gemini 3 Pro.</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Controls - Left Pane */}
          <div className="lg:col-span-4 space-y-10 animate-in slide-in-from-left duration-700">
            <div className="glass rounded-[2.5rem] p-10 space-y-12">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] italic">01. Source File</p>
                  </div>
                  <FileUpload 
                    label="Drop Resume" 
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    onFileSelect={(file, base64) => {
                      if (file && base64) setResumeFile({ name: file.name, data: base64, mimeType: file.type });
                      else setResumeFile(null);
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] italic">02. Target Parameters</p>
                  </div>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste job description heuristics..."
                    className="w-full h-44 p-8 rounded-3xl bg-white/5 border border-white/5 text-sm font-bold italic focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none placeholder:text-stone-600"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={state.isAnalyzing}
                  className={`group w-full py-8 rounded-3xl font-black text-xs uppercase tracking-[0.5em] text-white transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-3 ${
                    state.isAnalyzing ? 'bg-white/10 text-white/30' : 'bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-500/20'
                  }`}
                >
                  {state.isAnalyzing ? (
                    <div className="flex items-center space-x-3 italic">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Quantifying</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 italic">
                      <i className="fa-solid fa-bolt-lightning text-white group-hover:animate-pulse"></i>
                      <span>Analyze Profile</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Academic Footnote */}
            <div className="p-8 border border-white/5 rounded-3xl opacity-40 hover:opacity-100 transition-opacity">
               <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed italic">
                 Note: This system uses advanced NLP embeddings and semantic similarity scores for academic final-year project validation. Focus is on explainability.
               </p>
            </div>
          </div>

          {/* Results - Right Pane */}
          <div className="lg:col-span-8 space-y-16">
            {!state.result && !state.isAnalyzing && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-20 glass rounded-[3.5rem] group">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
                  <i className="fa-solid fa-satellite-dish text-2xl text-stone-700 group-hover:text-emerald-500"></i>
                </div>
                <h3 className="text-2xl font-black italic uppercase text-stone-600 tracking-tighter">System Idle</h3>
                <p className="mt-4 text-[9px] font-bold text-stone-700 uppercase tracking-widest">Connect data source to initiate</p>
              </div>
            )}

            {state.isAnalyzing && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-20 glass rounded-[3.5rem] animate-in fade-in duration-500">
                <div className="relative mb-12">
                  <div className="w-32 h-32 border-[2px] border-white/5 border-t-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/5 rounded-full animate-ping"></div>
                  </div>
                </div>
                <h3 className="text-3xl lg:text-4xl font-black italic uppercase text-white tracking-tighter mb-4 text-center">
                  {LOADING_MESSAGES[loadingMsgIdx]}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] animate-pulse italic">Calibrating Industrial Weights</span>
                </div>
              </div>
            )}

            {state.result && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                
                {/* Identity Summary Card */}
                <div className="glass p-12 lg:p-20 rounded-[4rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none transition-transform duration-1000 group-hover:rotate-12">
                    <i className="fa-solid fa-fingerprint text-[16rem]"></i>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="relative">
                      <svg className="w-56 h-56 drop-shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                        <circle className="text-white/5" strokeWidth="12" stroke="currentColor" fill="transparent" r="95" cx="112" cy="112" />
                        <circle 
                          className="text-emerald-500 transition-all duration-[2500ms] ease-out" 
                          strokeWidth="12" 
                          strokeDasharray={597} 
                          strokeDashoffset={597 - (597 * (state.result.scores?.finalAtsScore || 0)) / 100} 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                          r="95" cx="112" cy="112" 
                          transform="rotate(-90 112 112)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-7xl font-bold italic tracking-tighter leading-none text-white">{Math.round(state.result.scores?.finalAtsScore || 0)}</span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-3 italic">Index</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-6 text-center md:text-left">
                      <h3 className="text-5xl lg:text-7xl font-extrabold italic tracking-tighter leading-none uppercase text-white font-syne">The Audit.</h3>
                      <p className="text-stone-400 text-2xl lg:text-3xl font-bold italic leading-tight border-l-4 border-emerald-500/50 pl-8">
                        {state.result.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
                    <ScoreCard id="readabilityScore" label="Clarity" score={state.result.scores?.readabilityScore} color="text-white" />
                    <ScoreCard id="impactScore" label="Authority" score={state.result.scores?.impactScore} color="text-emerald-400" />
                    <ScoreCard id="formattingScore" label="Layout" score={state.result.scores?.formattingScore} color="text-amber-400" />
                    <ScoreCard id="keywordMatch" label="Semantic" score={state.result.scores?.keywordMatch} color="text-orange-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {/* Roadmap Section */}
                   <div className="glass p-12 rounded-[3.5rem] space-y-12">
                      <h4 className="text-2xl font-bold italic uppercase tracking-tighter text-white font-syne">Strategy Roadmap.</h4>
                      <div className="space-y-10">
                        {[
                          { p: "01", t: "Optimization", d: state.result.details?.roadmap?.phase1, c: "emerald" },
                          { p: "02", t: "Deployment", d: state.result.details?.roadmap?.phase2, c: "amber" },
                          { p: "03", t: "Dominance", d: state.result.details?.roadmap?.phase3, c: "orange" }
                        ].map((step, idx) => (
                          <div key={idx} className="flex space-x-6 group">
                            <span className={`text-[10px] font-black text-${step.c}-500 group-hover:scale-110 transition-transform italic`}>{step.p}</span>
                            <div className="space-y-2">
                              <p className="text-xs font-black uppercase tracking-widest text-white italic">{step.t}</p>
                              <p className="text-sm text-stone-500 font-bold italic">{step.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Content Audit */}
                   <div className="glass p-12 rounded-[3.5rem] space-y-12">
                      <h4 className="text-2xl font-bold italic uppercase tracking-tighter text-white font-syne">Role Potential.</h4>
                      <div className="flex flex-wrap gap-4">
                        {state.result.details?.rolePotential?.map((role, idx) => (
                          <span key={idx} className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-500 italic hover:bg-emerald-500 hover:text-white transition-all cursor-default">
                            {role}
                          </span>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Immediate Action</p>
                        <p className="text-lg font-bold italic text-amber-500 leading-tight">
                          {state.result.details?.immediateWins?.[0] || "Optimize structural metadata for parsed readability."}
                        </p>
                      </div>
                   </div>
                </div>

                {/* File Preview - Lower priority UI */}
                <div className="h-[400px] glass rounded-[3rem] overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                  <ResumePreview file={resumeFile} text={resumeText} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modern Floating Chat */}
      <ChatWidget geminiService={gemini.current} analysisContext={state.result} />

      <footer className="py-20 text-center border-t border-white/5 mt-40">
        <div className="opacity-10 text-[10px] font-black uppercase tracking-[1em] italic text-white">
          Zenith Elite Protocol &bull; Final Year Project Evaluation
        </div>
      </footer>
    </div>
  );
};

export default App;
