import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { Scenario } from '../constants/scenarios';

export interface LiveSessionConfig {
  accent: string;
  scenario: Scenario;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioQueue: Float32Array[] = [];
  private isPlaying = false;
  private nextStartTime = 0;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  async connect(config: LiveSessionConfig, onMessage: (text: string) => void, onInterrupted: () => void) {
    const systemInstruction = `You are a helpful English tutor. 
    Your current accent is ${config.accent}. 
    The topic of conversation is ${config.scenario.title} (${config.scenario.level} level). 
    The student's goals for this session are:
    ${config.scenario.goals.map(g => `- ${g}`).join('\n')}
    
    Engage the user in a natural conversation to help them achieve these goals and practice listening and speaking. 
    Provide gentle corrections if they make mistakes, but keep the flow natural. 
    Speak clearly in your assigned accent.`;

    this.session = await this.ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-12-2025",
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.getVoiceForAccent(config.accent)
            }
          }
        }
      },
      callbacks: {
        onopen: () => {
          this.startAudioCapture();
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.modelTurn?.parts) {
            for (const part of message.serverContent.modelTurn.parts) {
              if (part.inlineData?.data) {
                this.playAudioChunk(part.inlineData.data);
              }
              if (part.text) {
                onMessage(part.text);
              }
            }
          }
          if (message.serverContent?.interrupted) {
            this.stopPlayback();
            onInterrupted();
          }
        },
        onclose: () => {
          this.stopAudioCapture();
        },
        onerror: (error) => {
          console.error("Live API Error:", error);
        }
      }
    });
  }

  private getVoiceForAccent(accent: string): string {
    // Mapping accents to available voices (best effort)
    switch (accent) {
      case 'UK': return 'Kore';
      case 'AU': return 'Fenrir';
      case 'IN': return 'Puck';
      case 'US':
      default: return 'Zephyr';
    }
  }

  private async startAudioCapture() {
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = this.floatTo16BitPCM(inputData);
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      
      this.session.sendRealtimeInput({
        audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private stopAudioCapture() {
    this.source?.disconnect();
    this.processor?.disconnect();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(err => console.warn("Error closing AudioContext:", err));
    }
    this.audioContext = null;
    this.source = null;
    this.processor = null;
  }

  private floatTo16BitPCM(input: Float32Array) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private async playAudioChunk(base64Data: string) {
    if (!this.audioContext) return;
    const binary = atob(base64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) floatData[i] = pcmData[i] / 0x8000;

    const buffer = this.audioContext.createBuffer(1, floatData.length, 24000);
    buffer.getChannelData(0).set(floatData);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const startTime = Math.max(this.audioContext.currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + buffer.duration;
  }

  private stopPlayback() {
    this.nextStartTime = 0;
    // In a real app, we'd keep track of active sources and stop them
  }

  disconnect() {
    this.session?.close();
    this.stopAudioCapture();
  }
}
