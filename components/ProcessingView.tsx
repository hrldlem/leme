
import React from 'react';

interface CircularProgressProps {
  progress: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <circle className="text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="60" cy="60" />
        <circle
          className="text-brand-primary"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          style={{ transition: 'stroke-dashoffset 0.35s' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
        {`${progress}%`}
      </span>
    </div>
  );
};

interface ProcessingViewProps {
  fileName: string;
  progress: number;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ fileName, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <CircularProgress progress={progress} />
      <p className="mt-6 text-lg font-medium text-brand-light">Transcribing...</p>
      <p className="mt-1 text-sm text-gray-400 max-w-xs truncate">{fileName}</p>
    </div>
  );
};

export default ProcessingView;
