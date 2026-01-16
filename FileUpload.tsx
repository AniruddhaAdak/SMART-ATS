
import React, { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null, base64: string | null) => void;
  label: string;
  accept: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, label, accept }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (result && result.includes(',')) {
          const base64 = result.split(',')[1];
          onFileSelect(file, base64);
        } else {
          onFileSelect(file, null);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      onFileSelect(null, null);
    }
  };

  return (
    <div className="w-full">
      <div className={`relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-700 group ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 hover:border-emerald-500/30 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 ${selectedFile ? 'bg-emerald-500 shadow-xl shadow-emerald-500/30' : 'bg-white/5 group-hover:bg-white/10'}`}>
            <i className={`fa-solid ${selectedFile ? 'fa-check text-[#050505]' : 'fa-plus text-white/40 group-hover:text-white'} text-xl`}></i>
          </div>
          <div className="text-center">
            <span className={`block text-[11px] font-black uppercase tracking-[0.3em] italic transition-colors ${selectedFile ? 'text-emerald-400' : 'text-stone-500 group-hover:text-stone-300'}`}>
              {selectedFile ? selectedFile.name : label}
            </span>
            <span className="block mt-3 text-[9px] font-black text-stone-700 uppercase tracking-[0.6em] italic">PDF or Image</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
