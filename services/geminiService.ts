import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptionSegment } from '../types';

const TARGET_SAMPLE_RATE = 16000;
const CHUNK_SIZE = 4096 * 2; // Process ~0.5s of audio per chunk

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createPcmBlob(data: Float32Array): { data: string; mimeType: string; } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] before conversion
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: `audio/pcm;rate=${TARGET_SAMPLE_RATE}`,
  };
}

export const transcribeFile = (
  file: File,
  onProgress: (progress: number) => void
): Promise<TranscriptionSegment[]> => {
  return new Promise(async (resolve, reject) => {
    try {
        onProgress(5);
        // Fix for webkitAudioContext TypeScript error for cross-browser compatibility.
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        const originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
        onProgress(10);

        const offlineContext = new OfflineAudioContext(
            1, // Mono
            originalBuffer.duration * TARGET_SAMPLE_RATE,
            TARGET_SAMPLE_RATE
        );
        const source = offlineContext.createBufferSource();
        source.buffer = originalBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const resampledBuffer = await offlineContext.startRendering();
        onProgress(20);

        const monoChannelData = resampledBuffer.getChannelData(0);

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const transcriptionSegments: TranscriptionSegment[] = [];
        let lastEndTime = 0;
        let session: LiveSession;
        
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {},
                onmessage: (message: LiveServerMessage) => {
                    const transcriptionPart = message.serverContent?.inputTranscription;
                    if (transcriptionPart && transcriptionPart.isFinal && transcriptionPart.text) {
                        const endTime = (transcriptionPart.resultEndTime?.seconds ?? 0) + (transcriptionPart.resultEndTime?.nanos ?? 0) / 1e9;
                        if (endTime > lastEndTime) {
                            transcriptionSegments.push({
                                text: transcriptionPart.text,
                                startTime: lastEndTime,
                                endTime: endTime,
                            });
                            lastEndTime = endTime;
                        }
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Gemini Live API Error:', e);
                    reject(new Error('A streaming error occurred during transcription. Please check your network and try again.'));
                },
                onclose: () => {
                    resolve(transcriptionSegments);
                }
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                systemInstruction: "You are a highly accurate audio transcription service. Transcribe the user's speech precisely as spoken, in the original language.",
            }
        });
        
        session = await sessionPromise;
        onProgress(25);

        for (let i = 0; i < monoChannelData.length; i += CHUNK_SIZE) {
            const chunk = monoChannelData.slice(i, i + CHUNK_SIZE);
            if (chunk.length > 0) {
                const pcmBlob = createPcmBlob(chunk);
                session.sendRealtimeInput({ media: pcmBlob });
            }
            const currentProgress = 25 + Math.round((i / monoChannelData.length) * 70);
            onProgress(Math.min(95, currentProgress));
            
            await new Promise(res => setTimeout(res, 25)); 
        }

        session.close();
        onProgress(100);

    } catch (error) {
        console.error("Transcription failed:", error);
        if (error instanceof DOMException && error.name === 'EncodingError') {
             reject(new Error('Unsupported audio/video format. Please try a different file (e.g., mp3, wav, mp4).'));
        } else {
             reject(new Error('Failed to process the file. It may be corrupted or in an unsupported format.'));
        }
    }
  });
};
