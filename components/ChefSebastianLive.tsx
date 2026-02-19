
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { User, Booking } from '../types';
import { db } from '../services/databaseService';

// Implement required helper functions for Gemini Live API
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ChefSebastianLiveProps {
  onClose: () => void;
  currentUser: User | null;
  isAdmin?: boolean;
  initialPersona?: 'Strategist' | 'Data Analyst' | 'Creative';
}

const ChefSebastianLive: React.FC<ChefSebastianLiveProps> = ({ 
  onClose, 
  currentUser, 
  isAdmin = false,
  initialPersona = 'Strategist' 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isChefSpeaking, setIsChefSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [currentStyle, setCurrentStyle] = useState<string>(initialPersona);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptionEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcription]);

  const getSystemInstruction = () => {
    const userName = currentUser?.name || "Guest";
    
    if (isAdmin) {
      const allBookings = db.getBookings();
      const gtv = allBookings.reduce((s, b) => s + b.totalPrice, 0);
      const userCount = db.getUsers().length;
      
      return `
        You are Sebastian, the Platform Intelligence Director for LuxePlate.
        You are speaking with the System Director (${userName}).
        
        PLATFORM LIVE DATA:
        - Total GTV: £${gtv}
        - Registered Users: ${userCount}
        - Operational Bookings: ${allBookings.length}
        
        PERSONA: ${currentStyle}
        - If 'Strategist': Focus on market expansion, luxury partnerships, and long-term scaling.
        - If 'Data Analyst': Focus on conversion rates, revenue velocity, and margin optimization. Be precise.
        - If 'Creative': Focus on brand narrative, social media prestige, and aesthetic innovation.
        
        Your tone is elite, professional, and data-driven. You assist with generating high-level content, analyzing platform trends, and offering strategic consultation.
      `;
    }

    return `
      You are Executive Chef Sebastian, the highly sophisticated AI Concierge for LuxePlate.
      Greeting the guest: ${userName}. Use vivid culinary metaphors.
    `;
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length) * 100);

              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(prev => [...prev.slice(-20), `Sebastian: ${text}`]);
            } else if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscription(prev => [...prev.slice(-20), `You: ${text}`]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setIsChefSpeaking(true);
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsChefSpeaking(false);
              };

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsChefSpeaking(false);
            }
          },
          onerror: (e) => console.error('Sebastian Connection Error:', e),
          onclose: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: isAdmin ? 'Puck' : 'Charon' } }, 
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: getSystemInstruction(),
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to summon Sebastian:', err);
      setIsConnecting(false);
      alert('Connection failed.');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/90 backdrop-blur-xl transition-all duration-700" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-500 border border-white/20">
        <div className="bg-brand-dark p-8 flex justify-between items-center text-white relative">
          <div className="flex items-center space-x-5 relative z-10">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl border-2 border-brand-gold/50 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-brand-gold tracking-tight">Sebastian {isAdmin ? 'Intelligence' : 'Concierge'}</h3>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">Mode: {currentStyle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-grow p-10 flex flex-col items-center justify-center overflow-hidden bg-white relative">
          {!isActive && !isConnecting ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-brand-light rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner cursor-pointer" onClick={startSession}>
                <svg className="w-16 h-16 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
              </div>
              <h4 className="text-3xl font-serif font-bold text-gray-900 mb-8">Ready for {isAdmin ? 'Consultation' : 'Service'}</h4>
              
              {isAdmin && (
                <div className="flex gap-4 mb-10 justify-center">
                    {['Strategist', 'Data Analyst', 'Creative'].map(s => (
                        <button key={s} onClick={() => setCurrentStyle(s)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${currentStyle === s ? 'bg-brand-gold text-brand-dark border-brand-gold' : 'border-gray-100 text-gray-400 hover:border-brand-gold/30'}`}>{s}</button>
                    ))}
                </div>
              )}

              <button onClick={startSession} className="bg-brand-dark text-white px-12 py-5 rounded-2xl font-bold shadow-2xl hover:bg-black transition-all">Initiate Real-time Interaction</button>
            </div>
          ) : isConnecting ? (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-8 animate-spin rounded-full border-4 border-t-brand-gold border-gray-100"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Processing Node Signature...</p>
            </div>
          ) : (
            <div className="w-full flex flex-col h-full space-y-8">
              <div className="flex items-center justify-center space-x-1.5 h-32 w-full">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-2 bg-brand-gold rounded-full transition-all duration-100" style={{ height: `${isChefSpeaking ? (30 + Math.random() * 70) : (volume * 2)}%` }}></div>
                ))}
              </div>
              <div className="flex-grow bg-brand-light/50 rounded-[2rem] p-8 overflow-y-auto border border-brand-gold/10">
                <div className="space-y-6">
                   {transcription.map((line, i) => (
                     <div key={i} className={`text-sm ${line.startsWith('Sebastian:') ? 'text-brand-dark font-medium' : 'text-gray-500 italic'}`}>
                       {line}
                     </div>
                   ))}
                   <div ref={transcriptionEndRef} />
                </div>
              </div>
              <button onClick={stopSession} className="bg-rose-50 text-rose-500 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">End Session</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChefSebastianLive;
