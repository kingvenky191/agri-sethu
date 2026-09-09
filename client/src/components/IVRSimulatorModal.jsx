import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Volume2, VolumeX, Sparkles, X, Globe } from 'lucide-react';

export default function IVRSimulatorModal({ isOpen, onClose }) {
  const [callActive, setCallActive] = useState(false);
  const [lang, setLang] = useState('te'); // default telugu
  const [step, setStep] = useState(1);
  const [screenText, setScreenText] = useState('Press CALL to connect to 1800-AGRI-SETHU...');
  const [transcript, setTranscript] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cropChoice, setCropChoice] = useState('1');

  useEffect(() => {
    if (!isOpen && callActive) {
      endCall();
    }
  }, [isOpen]);

  const speakText = (text, languageCode = 'te-IN') => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'te') utterance.lang = 'te-IN';
    else if (lang === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-IN';

    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startCall = async () => {
    setCallActive(true);
    setStep(1);
    setTranscript([]);
    setScreenText('Connecting to AgriSethu Kisan Toll-Free Server...');

    try {
      const res = await fetch('/api/ivr/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, step: 1 })
      });
      const data = await res.json();
      setScreenText(data.displayPrompt);
      setTranscript([`🔊 IVR: ${data.speechText}`]);
      speakText(data.speechText);
    } catch (err) {
      setScreenText('Failed to connect to IVR server. Please check backend.');
    }
  };

  const endCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallActive(false);
    setStep(1);
    setScreenText('Call ended. Thank you for using AgriSethu Kisan Helpline.');
    setIsSpeaking(false);
  };

  const pressDigit = async (digit) => {
    if (!callActive) return;

    // Beep simulation
    playDTMFTone(digit);

    const newTranscript = [...transcript, `👉 Farmer pressed: [${digit}]`];
    setTranscript(newTranscript);

    if (step === 1) {
      // User selected crop (1: Tomato, 2: Chilli, 3: Cotton)
      setCropChoice(digit);
      setStep(2);
      try {
        const res = await fetch('/api/ivr/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang, step: 2, cropChoice: digit })
        });
        const data = await res.json();
        setScreenText(data.displayPrompt);
        setTranscript(prev => [...prev, `🔊 IVR: ${data.speechText}`]);
        speakText(data.speechText);
      } catch (err) {
        setScreenText('Error processing menu.');
      }
    } else if (step === 2) {
      // User selected service (1: Price, 2: Best Market, 3: Sell vs Wait)
      setStep(3);
      try {
        const res = await fetch('/api/ivr/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang, step: 3, cropChoice, serviceChoice: digit })
        });
        const data = await res.json();
        setScreenText(data.speechText);
        setTranscript(prev => [...prev, `🔊 AgriSethu: ${data.speechText}`]);
        speakText(data.speechText);
      } catch (err) {
        setScreenText('Error generating market response.');
      }
    } else if (step === 3) {
      // Reset or repeat
      setStep(1);
      startCall();
    }
  };

  const playDTMFTone = (digit) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 400 + Number(digit || 1) * 60;
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 120);
    } catch (e) {
      // Web Audio unsupported or blocked
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/75 backdrop-blur-xs p-4">
      <div className="bg-stone-900 text-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Kisan Toll-Free IVR Simulator</h3>
              <p className="text-2xs text-emerald-400 font-mono">1800-AGRI-SETHU (1800-2474-73848)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language & Sound Options */}
        <div className="flex items-center justify-between px-6 py-2 bg-stone-800/60 border-b border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-300 font-medium">Language:</span>
            <div className="flex gap-1">
              {[
                { code: 'te', label: 'తెలుగు' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'en', label: 'English' }
              ].map(l => (
                <button
                  key={l.code}
                  disabled={callActive}
                  onClick={() => setLang(l.code)}
                  className={`px-2 py-0.5 rounded text-2xs font-bold transition-colors ${
                    lang === l.code ? 'bg-emerald-600 text-white' : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                  } ${callActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-1 text-stone-400 hover:text-white text-2xs"
            title="Toggle Text-to-Speech audio"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Voice ON' : 'Mute'}</span>
          </button>
        </div>

        {/* Simulated Phone LCD Display */}
        <div className="p-6">
          <div className="bg-emerald-950/70 border border-emerald-800/80 rounded-2xl p-4 shadow-inner relative overflow-hidden">
            {/* Status indicator */}
            <div className="flex items-center justify-between text-2xs font-mono text-emerald-300 border-b border-emerald-800/50 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${callActive ? 'bg-emerald-400 animate-ping' : 'bg-stone-600'}`}></span>
                <span>{callActive ? 'CONNECTED • TOLL-FREE' : 'IDLE • 24x7 HELPLINE'}</span>
              </div>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-emerald-400 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Speaking...
                </span>
              )}
            </div>

            {/* LCD Content */}
            <p className="text-xs font-mono text-emerald-100 min-h-[50px] whitespace-pre-line leading-relaxed">
              {screenText}
            </p>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
              <button
                key={digit}
                disabled={!callActive}
                onClick={() => pressDigit(digit)}
                className={`py-3 rounded-2xl font-bold text-lg transition-all shadow-md active:scale-95 ${
                  callActive
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 hover:border-emerald-500 cursor-pointer'
                    : 'bg-stone-800/40 text-stone-600 border border-stone-800 cursor-not-allowed'
                }`}
              >
                {digit}
              </button>
            ))}
          </div>

          {/* Call / End Call Controls */}
          <div className="mt-6 flex gap-3">
            {!callActive ? (
              <button
                onClick={startCall}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 animate-bounce" />
                <span>Call 1800-AGRI-SETHU (Toll-Free)</span>
              </button>
            ) : (
              <button
                onClick={endCall}
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-700/30 transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call</span>
              </button>
            )}
          </div>

          {/* Call Transcript Log */}
          {transcript.length > 0 && (
            <div className="mt-4 bg-stone-950 p-3 rounded-xl border border-stone-800 max-h-32 overflow-y-auto text-2xs font-mono space-y-1 text-stone-400">
              <span className="font-bold text-stone-300 block border-b border-stone-800 pb-1">Call Dialogue Transcript:</span>
              {transcript.map((line, idx) => (
                <div key={idx} className={line.startsWith('👉') ? 'text-emerald-400' : 'text-stone-300'}>
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
