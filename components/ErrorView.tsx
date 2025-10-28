
import React from 'react';

interface ErrorViewProps {
  error: string | null;
  onReset: () => void;
}

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ErrorView: React.FC<ErrorViewProps> = ({ error, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full text-center">
      <ErrorIcon />
      <h2 className="mt-4 text-xl font-semibold text-red-400">An Error Occurred</h2>
      <p className="mt-2 text-gray-300 max-w-md">{error || 'Something went wrong.'}</p>
      <button
        onClick={onReset}
        className="mt-6 px-5 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorView;
