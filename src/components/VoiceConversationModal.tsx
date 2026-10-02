import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Volume2,
  AlertCircle,
  X,
  RefreshCw,
  Lock,
  VolumeX,
  Play,
  Sparkles,
} from 'lucide-react';

interface VoiceConversationModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  language,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [statusText, setStatusText] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    if (isOpen) {
      startVoiceSession();
    } else {
      stopVoiceSession();
    }

    return () => {
      stopVoiceSession();
    };
  }, [isOpen]);

  const pcmToBase64 = (pcmData: Float32Array): string => {
    const len = pcmData.length;
    const int16 = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      const s = Math.max(-1, Math.min(1, pcmData[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    const byteLen = bytes.byteLength;
    for (let i = 0; i < byteLen; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playAudioChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const audioCtx = outputAudioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;
      activeSourcesRef.current.push(source);

      setIsModelSpeaking(true);
      setStatusText(t.voiceSpeaking);

      source.onended = () => {
        const idx = activeSourcesRef.current.indexOf(source);
        if (idx !== -1) {
          activeSourcesRef.current.splice(idx, 1);
        }
        if (activeSourcesRef.current.length === 0) {
          setIsModelSpeaking(false);
          setStatusText(t.voiceListening);
        }
      };
    } catch (e) {
      console.error('Audio chunk playback error:', e);
    }
  };

  const clearAudioPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsModelSpeaking(false);
  };

  const startVoiceSession = async () => {
    setErrorMsg(null);
    setIsPermissionDenied(false);
    setIsConnecting(true);
    setStatusText(t.voiceConnecting);

    try {
      // 1. Request microphone access with direct user gesture support
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Your browser does not support audio capture via MediaDevices.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Setup AudioContext for recording at 16000Hz
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      inputAudioCtxRef.current = inputCtx;
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // 3. Connect to WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusText(t.voiceListening);

        // Connect mic audio pipeline
        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Basic volume detection
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setIsUserSpeaking(rms > 0.02);

        const base64Audio = pcmToBase64(inputData);
        wsRef.current.send(JSON.stringify({ audio: base64Audio }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio) {
            playAudioChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            clearAudioPlayback();
          } else if (msg.type === 'error') {
            setErrorMsg(msg.error || 'Live API reported an error');
          }
        } catch (e) {
          console.error('Error handling live ws message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket Live error:', e);
        setErrorMsg('WebSocket connection to Gemini Live failed.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err: any) {
      console.warn('Microphone or voice session initialization:', err);
      setIsConnecting(false);

      const isPermission =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.name === 'SecurityError' ||
        err?.message?.toLowerCase().includes('permission denied') ||
        err?.message?.toLowerCase().includes('not allowed');

      if (isPermission) {
        setIsPermissionDenied(true);
        setErrorMsg(
          language === 'hi'
            ? 'माइक्रोफ़ोन अनुमति अवरोधित है। कृपया ब्राउज़र URL बार में माइक्रोफ़ोन की अनुमति दें और पुनः प्रयास करें।'
            : 'Microphone permission was denied by the browser. Please allow microphone access in your browser address bar/settings, then click "Retry".'
        );
      } else {
        setErrorMsg(err?.message || 'Could not access microphone or connect to Gemini Live.');
      }
    }
  };

  const stopVoiceSession = () => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    clearAudioPlayback();

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {}
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsUserSpeaking(false);
    setIsModelSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#142A1E] border border-[#2D5A42] text-[#FAF7EE] rounded-3xl w-full max-w-lg p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#2E5A44]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#9CB7A8] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A3B2B] border border-[#3A6B4F] text-xs font-semibold text-[#80D2A4] mb-3">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Gemini 3.8 Live API • Real-Time Voice</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FAF7EE] font-serif mb-1">
          {t.voiceConversationTitle}
        </h3>
        <p className="text-xs text-[#9CB7A8] max-w-sm mb-4">
          {t.voiceConversationSubtitle}
        </p>

        {/* Permission Denied Recovery Banner */}
        {isPermissionDenied && (
          <div className="w-full bg-[#2A1616] border border-rose-800/80 rounded-2xl p-4 mb-4 text-left space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-900/60 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-200">
                  {language === 'hi' ? 'माइक्रोफ़ोन अनुमति आवश्यक है' : 'Microphone Permission Needed'}
                </p>
                <p className="text-rose-300/90 leading-relaxed text-[11px]">
                  {language === 'hi'
                    ? 'ब्राउज़र एड्रेस बार में 🔒 या कैमरा/माइक आइकन पर क्लिक करें, माइक्रोफ़ोन को "Allow" करें, और फिर नीचे क्लिक करें।'
                    : 'Click the lock 🔒 or camera/mic icon in your browser URL bar, set Microphone to "Allow", then click Retry below.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => startVoiceSession()}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पुनः प्रयास करें (Retry)' : 'Retry Microphone Access'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Center Orb Visualizer */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Animated concentric ripples */}
          <div
            className={`absolute w-44 h-44 rounded-full border border-emerald-500/20 transition-all duration-500 ${
              isModelSpeaking || isUserSpeaking ? 'scale-125 opacity-100 animate-ping' : 'scale-100 opacity-20'
            }`}
          />
          <div
            className={`absolute w-36 h-36 rounded-full bg-[#2E5A44]/40 blur-md transition-all duration-300 ${
              isModelSpeaking
                ? 'scale-130 bg-emerald-500/50'
                : isUserSpeaking
                ? 'scale-120 bg-amber-500/40'
                : 'scale-100'
            }`}
          />

          {/* Central orb */}
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-2 transition-all duration-300 ${
              isModelSpeaking
                ? 'bg-gradient-to-tr from-emerald-700 to-teal-400 border-emerald-300 scale-110 shadow-emerald-500/50'
                : isUserSpeaking
                ? 'bg-gradient-to-tr from-[#C29B38] to-amber-300 border-amber-200 scale-105 shadow-amber-500/40'
                : 'bg-gradient-to-tr from-[#1E3F2E] to-[#2E5A44] border-[#4E8566]'
            }`}
          >
            {isModelSpeaking ? (
              <Volume2 className="w-10 h-10 text-white animate-bounce" />
            ) : isMuted ? (
              <MicOff className="w-10 h-10 text-rose-300" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </div>
        </div>

        {/* Live Status Indicator Text */}
        <div className="mb-4 min-h-6 flex items-center justify-center">
          {errorMsg && !isPermissionDenied ? (
            <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/60 px-3 py-1.5 rounded-lg border border-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <p className="text-sm font-medium text-[#C8DFD2] tracking-wide">
              {statusText || (isConnected ? t.voiceListening : t.voiceConnecting)}
            </p>
          )}
        </div>

        {/* Suggested Voice Prompts */}
        <div className="w-full bg-[#1A3828]/60 border border-[#2D5A42] rounded-2xl p-3.5 mb-5 text-left">
          <p className="text-[11px] font-bold text-[#80D2A4] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Try asking naturally / बोल कर पूछें:</span>
          </p>
          <ul className="text-xs text-[#B5CCC0] space-y-1">
            <li>• "Can I patent an Ayurvedic herbal formulation in India?"</li>
            <li>• "What does Section 3(p) say about traditional remedies?"</li>
            <li>• "आयुर्वेदिक फॉर्मूलेशन में सिनर्जिस्टिक प्रभाव क्या होता है?"</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isConnected}
            className={`p-3.5 rounded-full border transition-all cursor-pointer disabled:opacity-40 ${
              isMuted
                ? 'bg-rose-900/40 border-rose-600 text-rose-300 hover:bg-rose-900/60'
                : 'bg-[#1E3F2E] border-[#3E6F54] text-[#D8EADB] hover:bg-[#2A573F]'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 shadow-lg shadow-rose-950/40 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{t.endVoice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
