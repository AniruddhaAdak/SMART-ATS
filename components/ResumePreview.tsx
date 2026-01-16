
import React from 'react';

interface ResumePreviewProps {
  file: { name: string, data: string, mimeType: string } | null;
  text: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ file, text }) => {
  if (!file && !text) return null;

  return (
    <div className="bg-black/40 rounded-[2.5rem] border border-white/5 h-full flex flex-col group transition-all duration-700">
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center italic">
          <i className="fa-solid fa-eye mr-4 text-emerald-500"></i>
          Credential View
        </h3>
        <span className="text-[10px] font-black text-white/20 truncate max-w-[180px] italic uppercase tracking-widest">
          {file ? file.name : 'RAW SOURCE'}
        </span>
      </div>
      <div className="flex-1 p-10 overflow-y-auto scrollbar-hide">
        {file && file.mimeType === 'application/pdf' ? (
          <iframe 
            src={`data:application/pdf;base64,${file.data}#toolbar=0`} 
            className="w-full h-full border-none rounded-3xl invert grayscale opacity-80"
            title="Resume View"
          />
        ) : file && file.mimeType.startsWith('image/') ? (
           <img src={`data:${file.mimeType};base64,${file.data}`} className="w-full rounded-3xl opacity-80 grayscale hover:grayscale-0 transition-all duration-700" alt="Resume" />
        ) : (
          <div className="font-sans text-[14px] text-stone-500 leading-relaxed whitespace-pre-wrap italic font-bold">
            {text || "Data synchronization pending..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
