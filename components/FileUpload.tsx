
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
        const base64 = (reader.result as string).split(',')[1];
        onFileSelect(file, base64);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      onFileSelect(null, null);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <div className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${selectedFile ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400'}`}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          {selectedFile ? (
            <>
              <i className="fa-solid fa-file-circle-check text-2xl text-indigo-600"></i>
              <span className="text-sm font-medium text-indigo-700 truncate max-w-full">
                {selectedFile.name}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  onFileSelect(null, null);
                }}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400"></i>
              <span className="text-sm text-slate-500">Drop PDF or Click to Browse</span>
              <span className="text-xs text-slate-400">PDF, DOCX supported</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
