import React, { useState, useCallback } from 'react';
import { TranscriptionStatus, TranscriptionSegment } from './types';
import FileUpload from './components/FileUpload';
import ProcessingView from './components/ProcessingView';
import TranscriptionView from './components/TranscriptionView';
import ErrorView from './components/ErrorView';
import { transcribeFile } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<TranscriptionStatus>(TranscriptionStatus.IDLE);
  const [transcription, setTranscription] = useState<TranscriptionSegment[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = useCallback(async (file: File) => {
    setStatus(TranscriptionStatus.PROCESSING);
    setFileName(file.name);
    setProgress(0);
    setError(null);
    setTranscription([]);

    try {
      const result = await transcribeFile(file, setProgress);
      setTranscription(result);
      setStatus(TranscriptionStatus.SUCCESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatus(TranscriptionStatus.ERROR);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus(TranscriptionStatus.IDLE);
    setFileName('');
    setTranscription([]);
    setError(null);
    setProgress(0);
  }, []);

  const renderContent = () => {
    switch (status) {
      case TranscriptionStatus.PROCESSING:
        return <ProcessingView fileName={fileName} progress={progress} />;
      case TranscriptionStatus.SUCCESS:
        return <TranscriptionView transcription={transcription} onReset={handleReset} />;
      case TranscriptionStatus.ERROR:
        return <ErrorView error={error} onReset={handleReset} />;
      case TranscriptionStatus.IDLE:
      default:
        return <FileUpload onFileSelect={handleFileSelect} setStatus={setStatus} setError={setError} />;
    }
  };

  return (
    <div className="bg-brand-dark min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl text-center">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-2">Universal Transcriber</h1>
          <p className="text-lg text-brand-secondary">Upload any audio or video file and get a high-quality transcription.</p>
        </header>
        <main className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 min-h-[300px] flex items-center justify-center transition-all duration-300">
          {renderContent()}
        </main>
        <footer className="mt-8 text-sm text-gray-500">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
