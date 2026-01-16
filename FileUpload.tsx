
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
      <div className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 ${selectedFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-stone-100 bg-stone-50 hover:border-emerald-300'}`}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-4">
          <i className={`fa-solid ${selectedFile ? 'fa-check text-emerald-500' : 'fa-upload text-stone-200'} text-3xl transition-transform duration-500 ${selectedFile ? 'scale-110' : ''}`}></i>
          <span className="text-xs font-black uppercase tracking-widest text-stone-400">
            {selectedFile ? selectedFile.name : label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
