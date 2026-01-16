
import React from 'react';

interface ResumePreviewProps {
  file: { name: string, data: string, mimeType: string } | null;
  text: string;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ file, text }) => {
  if (!file && !text) return null;

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col group transition-all duration-500">
      <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/30">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center">
          <i className="fa-solid fa-eye mr-2 text-emerald-500"></i>
          File View
        </h3>
        <span className="text-[9px] font-bold text-stone-400 truncate max-w-[120px]">
          {file ? file.name : 'Raw Text'}
        </span>
      </div>
      <div className="flex-1 p-8 overflow-y-auto scrollbar-hide bg-white">
        {file && file.mimeType === 'application/pdf' ? (
          <iframe 
            src={`data:application/pdf;base64,${file.data}#toolbar=0`} 
            className="w-full h-full border-none rounded-lg"
            title="Resume View"
          />
        ) : file && file.mimeType.startsWith('image/') ? (
           <img src={`data:${file.mimeType};base64,${file.data}`} className="w-full rounded-lg" alt="Resume" />
        ) : (
          <div className="font-sans text-[13px] text-stone-500 leading-loose whitespace-pre-wrap italic">
            {text || "No text available."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;
