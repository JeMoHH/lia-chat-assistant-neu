// import * as Speech from "expo-speech";
import { apiClient } from "./api-client";

export interface VoiceRecording {
  id: string;
  uri: string;
  duration: number;
  timestamp: number;
  transcription?: string;
}

export interface VoiceSettings {
  language: string;
  rate: number;
  pitch: number;
  volume: number;
  enableAutoPlay: boolean;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  language: "en-US",
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  enableAutoPlay: false,
};

export class VoiceService {
  private settings: VoiceSettings = { ...DEFAULT_VOICE_SETTINGS };
  private isPlaying = false;
  private recordingStartTime: number = 0;

  async initialize(): Promise<void> {
    try {
      // Initialize speech service
      // Voice service initialized
    } catch (error) {
      console.error("Failed to initialize voice service:", error);
    }
  }

  async startRecording(): Promise<VoiceRecording | null> {
    try {
      // In a real app, you would use expo-audio or react-native-audio-recorder-player
      // For now, we'll return a mock recording
      this.recordingStartTime = Date.now();

      return {
        id: `rec_${Date.now()}`,
        uri: "",
        duration: 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to start recording:", error);
      return null;
    }
  }

  async stopRecording(): Promise<VoiceRecording | null> {
    try {
      const duration = Date.now() - this.recordingStartTime;

      const recording: VoiceRecording = {
        id: `rec_${Date.now()}`,
        uri: "",
        duration,
        timestamp: Date.now(),
      };

      return recording;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      return null;
    }
  }

  async transcribeRecording(recording: VoiceRecording): Promise<string | null> {
    try {
      if (!recording.uri) {
        return null;
      }

      const audioBlob = await this.uriToBlob(recording.uri);
      const response = await apiClient.transcribeAudio(audioBlob);

      if (response.success && response.data) {
        recording.transcription = response.data.text;
        return response.data.text;
      }

      return null;
    } catch (error) {
      console.error("Failed to transcribe recording:", error);
      return null;
    }
  }

  async speak(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    try {
      const voiceSettings = { ...this.settings, ...settings };

      // Text-to-speech would be called here
      // await Speech.speak(text, {...});

      this.isPlaying = true;
    } catch (error) {
      console.error("Failed to speak:", error);
    }
  }

  async stopSpeaking(): Promise<void> {
    try {
      // Stop speech would be called here
      // await Speech.stop();
      this.isPlaying = false;
    } catch (error) {
      console.error("Failed to stop speaking:", error);
    }
  }

  async synthesizeAndPlay(text: string, settings?: Partial<VoiceSettings>): Promise<void> {
    try {
      const voiceSettings = { ...this.settings, ...settings };
      const response = await apiClient.synthesizeSpeech(text, voiceSettings.language);

      if (response.success && response.data) {
        // For now, we'll just use the speak API
        await this.speak(text, settings);
      }
    } catch (error) {
      console.error("Failed to synthesize and play:", error);
    }
  }

  setVoiceSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  getVoiceSettings(): VoiceSettings {
    return { ...this.settings };
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.stopSpeaking();
      }
    } catch (error) {
      console.error("Failed to cleanup voice service:", error);
    }
  }

  private async uriToBlob(uri: string): Promise<Blob> {
    const response = await fetch(uri);
    return response.blob();
  }

  async getAvailableLanguages(): Promise<string[]> {
    return [
      "en-US",
      "en-GB",
      "de-DE",
      "fr-FR",
      "es-ES",
      "it-IT",
      "ja-JP",
      "zh-CN",
      "zh-TW",
      "ko-KR",
      "pt-BR",
      "ru-RU",
    ];
  }
}

export const voiceService = new VoiceService();
