
import React, { useState, useCallback, useRef } from 'react';
import { TranscriptionStatus } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  setStatus: (status: TranscriptionStatus) => void;
  setError: (error: string) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, setStatus, setError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | undefined | null) => {
    if (file) {
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        setError('Unsupported file type. Please upload an audio or video file.');
        setStatus(TranscriptionStatus.ERROR);
      }
    }
  }, [onFileSelect, setStatus, setError]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const dropzoneClasses = `
    w-full p-8 border-2 border-dashed rounded-lg transition-all duration-300 ease-in-out cursor-pointer
    flex flex-col items-center justify-center text-center
    ${isDragging ? 'border-brand-primary bg-brand-dark/30 scale-105' : 'border-gray-600 hover:border-brand-secondary hover:bg-brand-dark/10'}
  `;

  return (
    <div
      className={dropzoneClasses}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="audio/*,video/*"
      />
      <UploadIcon />
      <p className="mt-4 text-xl font-semibold text-brand-light">Drop your file here</p>
      <p className="mt-1 text-gray-400">or click to browse</p>
      <p className="mt-2 text-xs text-gray-500">Supports all common audio and video formats</p>
    </div>
  );
};

export default FileUpload;
