
import React, { useState } from 'react';
import { GeminiAnalyzer } from './services/geminiService';
import { AnalysisState } from './types';
import { SCORING_WEIGHTS, MOCK_JOB_DESCRIPTIONS } from './constants';
import ScoreCard from './components/ScoreCard';
import FileUpload from './components/FileUpload';

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !resumeFile) {
      setState(prev => ({ ...prev, error: "Upload a resume to begin your audit." }));
      return;
    }

    setState({ isAnalyzing: true, result: null, error: null });

    try {
      const analyzer = new GeminiAnalyzer();
      const result = await analyzer.analyzeResume(
        resumeText, 
        jdText, 
        resumeFile ? { data: resumeFile.data, mimeType: resumeFile.mimeType } : undefined
      );
      setState({ isAnalyzing: false, result, error: null });
    } catch (err: any) {
      setState({ isAnalyzing: false, result: null, error: err.message });
    }
  };

  const reset = () => {
    setResumeText('');
    setJdText('');
    setResumeFile(null);
    setState({ isAnalyzing: false, result: null, error: null });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Decorative Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-100/30 rounded-full blur-[160px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 h-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
              <i className="fa-solid fa-infinity text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">SMART-ATS</h1>
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none mt-0.5">V3 Enterprise Pipeline</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={reset} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest px-4">Reset</button>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="bg-slate-900 text-white text-[10px] font-black px-6 py-2.5 rounded-full uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all">Documentation</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: CONTROL PANEL */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-32 space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Elite Resume Intelligence.</h2>
                <p className="text-slate-500 font-medium">Quantify your career narrative with industrial-grade AI.</p>
              </div>

              {/* INPUT CARDS */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Step 01 / Profile</span>
                    <i className="fa-solid fa-file-invoice text-slate-300"></i>
                  </div>
                  <FileUpload 
                    label="Resume Document" 
                    accept=".pdf,.docx"
                    onFileSelect={(file, base64) => {
                      if (file && base64) {
                        setResumeFile({ 
                          name: file.name, 
                          data: base64, 
                          mimeType: file.type || 'application/pdf' 
                        });
                      } else {
                        setResumeFile(null);
                      }
                    }}
                  />
                  <div className="mt-6">
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Or paste professional summary here..."
                      className="w-full h-32 p-5 rounded-2xl border border-slate-100 bg-slate-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Step 02 / Target (Optional)</span>
                    <i className="fa-solid fa-bullseye text-slate-300"></i>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {MOCK_JOB_DESCRIPTIONS.map((t, i) => (
                      <button 
                        key={i} 
                        onClick={() => setJdText(t.content)}
                        className={`text-[9px] font-black px-3 py-1.5 rounded-lg border transition-all uppercase tracking-tight ${jdText === t.content ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Provide Job Description for compatibility matching..."
                    className="w-full h-32 p-5 rounded-2xl border border-slate-100 bg-slate-50/30 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/40 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={state.isAnalyzing}
                  className={`group w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl transition-all flex items-center justify-center space-x-3 active:scale-95 ${
                    state.isAnalyzing 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-slate-900 hover:shadow-indigo-200 hover:-translate-y-1'
                  }`}
                >
                  {state.isAnalyzing ? (
                    <><i className="fa-solid fa-spinner-third fa-spin text-lg"></i><span>Synchronizing Data...</span></>
                  ) : (
                    <><i className="fa-solid fa-bolt text-indigo-400 group-hover:scale-125 transition-transform"></i><span>Initialize Deep Audit</span></>
                  )}
                </button>

                {state.error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 animate-pulse">
                    <i className="fa-solid fa-circle-exclamation text-lg"></i>
                    <span>{state.error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ANALYTICS ENGINE */}
          <div className="lg:col-span-7 pb-20">
            {!state.result && !state.isAnalyzing && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgb(0,0,0,0.02)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent"></div>
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                  <i className="fa-solid fa-layer-group text-4xl text-slate-200"></i>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Engine Standby</h3>
                <p className="text-slate-400 text-sm font-medium max-w-xs text-center leading-relaxed">
                  Provide your profile data on the left to start the multidimensional scoring pipeline.
                </p>
              </div>
            )}

            {state.isAnalyzing && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm -z-10 animate-pulse"></div>
                <div className="relative mb-12">
                   <div className="w-40 h-40 border-[3px] border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <i className="fa-solid fa-microchip text-4xl text-slate-900 animate-pulse"></i>
                   </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Quantifying Credentials</h3>
                <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-12">Vectorizing resume nodes...</p>
                <div className="w-full max-w-xs space-y-4">
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 w-1/3 animate-shimmer"></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Tokenizing</span>
                    <span>42% Complete</span>
                  </div>
                </div>
              </div>
            )}

            {state.result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                
                {/* HERO SCORE BOARD */}
                <div className="bg-white p-12 rounded-[3rem] shadow-[0_20px_60px_rgb(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-50/40 rounded-full blur-[100px] pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative group">
                      <div className="absolute inset-[-8px] bg-slate-900/5 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700 blur-xl"></div>
                      <svg className="w-52 h-52 drop-shadow-2xl">
                        <circle className="text-slate-50" strokeWidth="14" stroke="currentColor" fill="transparent" r="85" cx="104" cy="104" />
                        <circle 
                          className="text-slate-900 transition-all duration-[1500ms] ease-out" 
                          strokeWidth="14" 
                          strokeDasharray={534} 
                          strokeDashoffset={534 - (534 * (state.result.scores?.finalAtsScore ?? 0)) / 100} 
                          strokeLinecap="round" 
                          stroke="currentColor" 
                          fill="transparent" 
                          r="85" 
                          cx="104" 
                          cy="104" 
                          transform="rotate(-90 104 104)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-black text-slate-900 leading-none tracking-tighter">{Math.round(state.result.scores?.finalAtsScore ?? 0)}</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">ATS MATCH</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                      <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg mb-2">Final Evaluation</div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Candidate Scorecard.</h3>
                      <p className="text-slate-500 text-base leading-relaxed font-medium">
                        {(state.result.explanation ?? "").split('.')[0]}. {jdText ? "Based on role-specific algorithmic matching." : "Audited against global professional benchmarks."}
                      </p>
                    </div>
                  </div>

                  {/* EXTENDED SCORES GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                    <ScoreCard label="Readability" score={state.result.scores?.readabilityScore ?? 0} color="text-slate-900" />
                    <ScoreCard label="Impact" score={state.result.scores?.impactScore ?? 0} color="text-indigo-600" />
                    <ScoreCard label="Formatting" score={state.result.scores?.formattingScore ?? 0} color="text-emerald-600" />
                    <ScoreCard label="Keywords" score={state.result.scores?.keywordMatch ?? 0} color="text-blue-600" />
                  </div>
                </div>

                {/* DETAILED METRICS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Experience Metric</span>
                      <ScoreCard label="Role Seniority Match" score={state.result.scores?.experienceScore ?? 0} weight={SCORING_WEIGHTS.EXPERIENCE} color="text-indigo-600" />
                   </div>
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Contextual Metric</span>
                      <ScoreCard label="Semantic Alignment" score={state.result.scores?.semanticSimilarity ?? 0} weight={SCORING_WEIGHTS.SEMANTIC} color="text-violet-600" />
                   </div>
                </div>

                {/* CONTENT AUDIT PANEL */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
                     <i className="fa-solid fa-list-check text-9xl text-slate-900"></i>
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                    <span className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center mr-4 shadow-xl">
                      <i className="fa-solid fa-magnifying-glass-chart"></i>
                    </span>
                    Content Quality Audit
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {[
                      { label: "Bullet Point Quality", value: state.result.details?.contentAudit?.bulletPointQuality, icon: "fa-list-ul" },
                      { label: "Active Verbs", value: state.result.details?.contentAudit?.activeVerbUsage, icon: "fa-bolt" },
                      { label: "Quantified Results", value: state.result.details?.contentAudit?.quantifiableResults, icon: "fa-calculator" }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-3 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                         <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                           <i className={`fa-solid ${item.icon} text-sm`}></i>
                         </div>
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.label}</h4>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SKILLS INTELLIGENCE */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-slate-900">Skills Intelligence</h3>
                    <div className="flex space-x-2">
                       <span className="text-[9px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg uppercase">Extracted</span>
                       <span className="text-[9px] font-black px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg uppercase">Categorized</span>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                        Detected Competencies
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {(state.result.details?.matchedKeywords ?? []).map((kw, idx) => (
                          <span key={idx} className="px-5 py-2.5 bg-slate-50 text-slate-900 text-[11px] font-black rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all cursor-default">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                         <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-2"></span>
                         Critical Opportunity Gaps
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {(state.result.details?.missingKeywords ?? []).map((kw, idx) => (
                          <span key={idx} className="px-5 py-2.5 bg-rose-50/30 text-rose-700 text-[11px] font-black rounded-2xl border border-rose-100">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROADMAP & POTENTIAL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200">
                    <h3 className="text-xl font-black mb-8 flex items-center uppercase tracking-widest">
                      <i className="fa-solid fa-route mr-4 text-indigo-400"></i>
                      Optimization
                    </h3>
                    <ul className="space-y-5">
                      {(state.result.details?.improvementSuggestions ?? []).slice(0, 4).map((s, idx) => (
                        <li key={idx} className="flex items-start space-x-4 text-sm opacity-80 group">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:scale-150 transition-transform"></div>
                          <span className="font-medium leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl"></div>
                    <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center uppercase tracking-widest">
                      <i className="fa-solid fa-chess mr-4 text-indigo-600"></i>
                      Potential Roles
                    </h3>
                    <div className="space-y-3">
                      {(state.result.details?.rolePotential ?? []).map((role, idx) => (
                        <div key={idx} className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-900 text-sm font-black flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all cursor-default">
                           <span>{role}</span>
                           <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-indigo-600 transition-colors"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FORMULA AUDIT */}
                <div id="formula" className="bg-slate-950 text-slate-500 p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                  <div className="relative z-10">
                    <h3 className="text-white text-xl font-black mb-8 uppercase tracking-[0.3em] flex items-center">
                      <i className="fa-solid fa-code-merge mr-4 text-indigo-500"></i>
                      Pipeline Methodology
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-mono text-[11px] leading-relaxed">
                      <div className="space-y-6">
                        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                          <p className="text-indigo-400 mb-4 font-black uppercase tracking-tighter">// AGGREGATION_LOGIC_V3</p>
                          <code className="text-slate-300 block">
                            Match(R, J) = (0.35 * Keywords) + (0.40 * Semantics) + (0.10 * Education) + (0.15 * Experience)
                          </code>
                        </div>
                        <div className="flex flex-wrap gap-4">
                           <div className="text-center bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex-1">
                              <div className="text-indigo-400 font-black">NLP v3</div>
                              <div className="text-[8px] opacity-40 uppercase">Engine</div>
                           </div>
                           <div className="text-center bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex-1">
                              <div className="text-emerald-400 font-black">TF-IDF</div>
                              <div className="text-[8px] opacity-40 uppercase">Vector</div>
                           </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p>
                          This system performs a deep architectural match by analyzing structural dependencies in the resume content. 
                          It uses high-dimensional embeddings to map semantic distance between career milestones and job requirements.
                        </p>
                        <p className="italic text-slate-300/60 border-l-2 border-indigo-500/40 pl-4 py-2">
                          "{state.result.explanation ?? "Detailed logic generated by Gemini 3 Flash."}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-40 pb-20 border-t border-slate-200/40 pt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center space-x-12 mb-10 grayscale opacity-30 group">
             <i className="fa-brands fa-react text-3xl hover:grayscale-0 transition-all cursor-pointer"></i>
             <i className="fa-solid fa-dna text-3xl hover:grayscale-0 transition-all cursor-pointer"></i>
             <i className="fa-solid fa-server text-3xl hover:grayscale-0 transition-all cursor-pointer"></i>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">System status: Operational / Research Grade Alpha</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
