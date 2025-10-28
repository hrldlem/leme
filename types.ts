export enum TranscriptionStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface TranscriptionSegment {
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
}
