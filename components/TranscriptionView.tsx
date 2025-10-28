import React, { useState, useCallback } from 'react';
import { TranscriptionSegment } from '../types';

interface TranscriptionViewProps {
  transcription: TranscriptionSegment[];
  onReset: () => void;
}

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const formatTimestamp = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }
    return `${paddedMinutes}:${paddedSeconds}`;
};

const TranscriptionView: React.FC<TranscriptionViewProps> = ({ transcription, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const fullText = transcription.map(segment => segment.text).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [transcription]);

  return (
    <div className="flex flex-col items-center w-full text-left">
      <h2 className="text-2xl font-bold text-brand-primary self-start mb-4">Transcription Result</h2>
      <div className="w-full h-64 overflow-y-auto p-4 bg-brand-dark/50 rounded-lg border border-gray-700 mb-6 font-mono">
        {transcription && transcription.length > 0 ? (
          transcription.map((segment, index) => (
            <div key={index} className="flex flex-row items-start mb-3 last:mb-0">
              <div className="w-24 flex-shrink-0 text-brand-secondary text-sm pt-1">
                [{formatTimestamp(segment.startTime)}]
              </div>
              <p className="flex-1 text-gray-200 whitespace-pre-wrap font-sans">
                {segment.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 font-sans">No speech detected.</p>
        )}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors duration-200 disabled:opacity-50"
          disabled={!transcription || transcription.length === 0}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span className="ml-2">{copied ? 'Copied!' : 'Copy Text'}</span>
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors duration-200"
        >
          Transcribe Another
        </button>
      </div>
    </div>
  );
};

export default TranscriptionView;
