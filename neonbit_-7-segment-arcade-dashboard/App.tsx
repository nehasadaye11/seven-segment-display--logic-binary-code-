
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Settings2, 
  Hash, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Terminal,
  Activity,
  Volume2,
  VolumeX,
  Download,
  Table as TableIcon,
  X
} from 'lucide-react';
import { DashboardMode } from './types';
import { DIGIT_MAPS, COLOR_PALETTE, SEGMENT_LABELS } from './constants';
import SevenSegment from './components/SevenSegment';

const App: React.FC = () => {
  const [mode, setMode] = useState<DashboardMode>(DashboardMode.ANIMATION);
  const [binaryString, setBinaryString] = useState<string>('0000000');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(250);
  const [currentDecimal, setCurrentDecimal] = useState<number>(0);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [history, setHistory] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isTruthTableOpen, setIsTruthTableOpen] = useState<boolean>(false);

  // Use number type for intervalRef to fix 'Cannot find namespace NodeJS' error in browser environment
  const intervalRef = useRef<number | null>(null);

  // Audio Beep Utility
  const playBeep = useCallback((freq = 880, duration = 0.05) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      /* Audio often blocked by browser until interaction */
    }
  }, [soundEnabled]);

  // Handle step based on mode
  const handleNextStep = useCallback(() => {
    if (mode === DashboardMode.ANIMATION) {
      setCurrentDecimal(prev => {
        const next = (prev + 1) % 128;
        setBinaryString(next.toString(2).padStart(7, '0'));
        playBeep(440 + (next * 4));
        return next;
      });
    } else if (mode === DashboardMode.COUNTER) {
      setCurrentDecimal(prev => {
        const next = (prev + 1) % 10;
        setBinaryString(DIGIT_MAPS[next]);
        playBeep(880 + (next * 20));
        return next;
      });
    }
  }, [mode, playBeep]);

  // Handle Play/Pause intervals
  useEffect(() => {
    if (isPlaying && (mode === DashboardMode.ANIMATION || mode === DashboardMode.COUNTER)) {
      intervalRef.current = window.setInterval(handleNextStep, speed) as unknown as number;
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, mode, handleNextStep]);

  // Track history for sparkline - we normalize it based on the mode
  useEffect(() => {
    const historyVal = mode === DashboardMode.COUNTER ? (currentDecimal * 12.7) : currentDecimal;
    setHistory(prev => [historyVal, ...prev].slice(0, 40));
  }, [currentDecimal, mode]);

  const toggleSegment = (index: number) => {
    if (mode !== DashboardMode.MANUAL) return;
    const newArr = binaryString.split('');
    newArr[index] = newArr[index] === '1' ? '0' : '1';
    const newBinary = newArr.join('');
    setBinaryString(newBinary);
    setCurrentDecimal(parseInt(newBinary, 2));
    playBeep(660);
  };

  const handleModeChange = (newMode: DashboardMode) => {
    setIsPlaying(false);
    setMode(newMode);
    playBeep(1200, 0.1);
    if (newMode === DashboardMode.COUNTER) {
      setBinaryString(DIGIT_MAPS[0]);
      setCurrentDecimal(0);
    } else {
      setBinaryString('0000000');
      setCurrentDecimal(0);
    }
  };

  const handleManualBinaryInput = (val: string) => {
    const cleaned = val.replace(/[^01]/g, '').slice(0, 7);
    const finalBinary = cleaned.padEnd(7, '0');
    setBinaryString(finalBinary);
    if (mode === DashboardMode.MANUAL || mode === DashboardMode.ANIMATION) {
      setCurrentDecimal(parseInt(finalBinary, 2));
    }
  };

  const navigateCounter = (direction: number) => {
    const nextDigit = (currentDecimal + direction + 10) % 10;
    setCurrentDecimal(nextDigit);
    setBinaryString(DIGIT_MAPS[nextDigit]);
    playBeep(direction > 0 ? 1000 : 800);
  };

  const reset = () => {
    setIsPlaying(false);
    playBeep(200, 0.2);
    if (mode === DashboardMode.COUNTER) {
      setCurrentDecimal(0);
      setBinaryString(DIGIT_MAPS[0]);
    } else {
      setCurrentDecimal(0);
      setBinaryString('0000000');
    }
  };

  const exportState = () => {
    const data = {
      timestamp: new Date().toISOString(),
      mode,
      decimal: currentDecimal,
      binary: binaryString,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neonbit-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    playBeep(1500, 0.1);
  };

  return (
    <div className="min-h-screen text-slate-100 p-4 md:p-8 flex flex-col items-center select-none overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center shadow-[0_0_25px_#ec4899] animate-pulse">
            <Zap className="text-white" fill="white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter font-['Orbitron'] text-white">
              NEON<span className="text-pink-500">BIT</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-[0.2em]">7-SEGMENT LOGIC CONTROLLER v1.2</p>
          </div>
        </div>

        <nav className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-inner">
          {[
            { id: DashboardMode.ANIMATION, label: '0-127 Cycle', icon: Activity },
            { id: DashboardMode.MANUAL, label: 'Manual Edit', icon: Settings2 },
            { id: DashboardMode.COUNTER, label: '0-9 Counter', icon: Hash }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${
                mode === m.id 
                  ? 'bg-pink-600 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] translate-y-[-1px]' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <m.icon size={16} />
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Panel: Display */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-900/40 p-8 md:p-12 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-6 left-8 flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                 <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{isPlaying ? 'Running' : 'Halted'}</span>
               </div>
               <div className="h-4 w-[1px] bg-slate-800"></div>
               <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  LOAD: {Math.floor(Math.random() * 40 + 20)}%
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-around gap-12 mt-4">
              <SevenSegment binary={binaryString} showLabels={showLabels} />
              
              <div className="flex flex-col items-center md:items-start gap-8">
                <div className="text-center md:text-left">
                  <span className="text-[10px] font-mono text-pink-500 uppercase tracking-widest block mb-2 font-bold">
                    {mode === DashboardMode.COUNTER ? 'Digit Index' : 'Register (Dec)'}
                  </span>
                  <div className="text-8xl font-['Orbitron'] font-bold text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    {currentDecimal}
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest block mb-2 font-bold">Bitstream (abcdefg)</span>
                  <div className="text-3xl font-mono font-bold text-green-400 tracking-widest bg-black/60 px-6 py-3 rounded-2xl border border-green-900/30 shadow-2xl">
                    {binaryString.split('').map((bit, idx) => (
                      <span key={idx} className={`${bit === '1' ? 'text-green-400' : 'text-slate-800'} transition-colors duration-200`}>
                        {bit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowLabels(!showLabels)}
                    className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-pink-400 transition-colors uppercase"
                  >
                    <Info size={14} />
                    {showLabels ? 'Hide Labels' : 'Show Labels'}
                  </button>
                  <button 
                    onClick={() => setIsTruthTableOpen(true)}
                    className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-pink-400 transition-colors uppercase"
                  >
                    <TableIcon size={14} />
                    Truth Table
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Graph */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 uppercase text-[10px] font-mono tracking-widest font-bold">
                  <Activity size={14} className="text-pink-500" />
                  <span>Real-time Signal Analysis</span>
                </div>
                <div className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-1 rounded">CACHE: 40 SAMPLES</div>
             </div>
             <div className="h-16 flex items-end gap-[3px]">
                {history.map((val, i) => (
                  <motion.div
                    key={`${i}-${val}`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: Math.max(0.1, val / 127) }}
                    className="flex-1 bg-pink-500/40 border-t-2 border-pink-400 rounded-t-sm"
                    style={{ height: '100%', transformOrigin: 'bottom' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                ))}
             </div>
          </div>
        </div>

        {/* Right Panel: Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col gap-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-pink-500" />
                <h2 className="font-bold text-lg text-white font-['Orbitron']">
                  {mode === DashboardMode.ANIMATION && "Sequence"}
                  {mode === DashboardMode.MANUAL && "Logic Gates"}
                  {mode === DashboardMode.COUNTER && "Digit Nav"}
                </h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)} 
                  className={`p-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors ${soundEnabled ? 'text-pink-500' : 'text-slate-600'}`}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={exportState} className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400">
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Mode 1 & Mode 3 Shared Controls (Play/Pause) */}
            {(mode === DashboardMode.ANIMATION || mode === DashboardMode.COUNTER) && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-center gap-6">
                  {mode === DashboardMode.COUNTER && (
                    <button 
                      onClick={() => navigateCounter(-1)}
                      className="w-12 h-12 rounded-xl border-2 border-slate-800 text-slate-400 hover:border-pink-500 hover:text-pink-500 transition-all flex items-center justify-center"
                    >
                      <ChevronLeft size={24} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      playBeep(isPlaying ? 200 : 800, 0.1);
                    }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-4 shadow-2xl ${
                      isPlaying 
                        ? 'border-red-500 text-red-500 hover:bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                        : 'border-green-500 text-green-500 hover:bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.3)] scale-110'
                    }`}
                  >
                    {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                  </button>
                  {mode === DashboardMode.COUNTER && (
                    <button 
                      onClick={() => navigateCounter(1)}
                      className="w-12 h-12 rounded-xl border-2 border-slate-800 text-slate-400 hover:border-pink-500 hover:text-pink-500 transition-all flex items-center justify-center"
                    >
                      <ChevronRight size={24} />
                    </button>
                  )}
                  {mode === DashboardMode.ANIMATION && (
                    <button 
                      onClick={reset}
                      className="w-12 h-12 rounded-xl border-2 border-slate-800 text-slate-400 hover:bg-slate-800 transition-all flex items-center justify-center"
                    >
                      <RotateCcw size={20} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3 px-2">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                    <span>Scan Frequency</span>
                    <span className="text-pink-500">{speed}ms</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="50" 
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            )}

            {/* Mode 2 Controls (Manual) */}
            {mode === DashboardMode.MANUAL && (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {SEGMENT_LABELS.map((label, i) => (
                    <button
                      key={label}
                      onClick={() => toggleSegment(i)}
                      className={`h-14 flex flex-col items-center justify-center rounded-xl border-2 transition-all font-mono font-bold ${
                        binaryString[i] === '1' 
                          ? 'border-pink-500 bg-pink-500/20 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]' 
                          : 'border-slate-800 bg-slate-950 text-slate-600'
                      }`}
                    >
                      <span className="text-[10px] opacity-40 mb-1">{label}</span>
                      <span className="text-base">{binaryString[i]}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Bit Stream Access</label>
                  <input 
                    type="text"
                    value={binaryString}
                    onChange={(e) => handleManualBinaryInput(e.target.value)}
                    placeholder="0000000"
                    className="w-full bg-black/60 border-2 border-slate-800 rounded-2xl px-6 py-4 text-2xl font-mono text-green-400 focus:border-green-500/40 outline-none transition-all placeholder:text-slate-900 shadow-inner"
                  />
                  <p className="text-[10px] text-slate-600 font-mono italic text-center">
                    Direct logic override - values displayed in base 10 register.
                  </p>
                </div>
              </div>
            )}

            {/* Mode 3 Bottom Grid */}
            {mode === DashboardMode.COUNTER && (
              <div className="grid grid-cols-5 gap-2">
                {[0,1,2,3,4,5,6,7,8,9].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      setCurrentDecimal(num);
                      setBinaryString(DIGIT_MAPS[num]);
                      playBeep(400 + num * 50);
                    }}
                    className={`py-3 text-xs font-mono font-bold rounded-xl transition-all border ${
                      currentDecimal === num 
                        ? 'bg-pink-500 border-pink-400 text-white shadow-lg' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest border border-slate-800 py-3 rounded-xl hover:bg-red-950/20"
              >
                <RotateCcw size={14} />
                System Reset
              </button>
              <button 
                onClick={() => setIsTruthTableOpen(true)}
                className="px-6 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest border border-slate-800 py-3 rounded-xl hover:bg-cyan-950/20"
              >
                <TableIcon size={14} />
              </button>
            </div>
          </div>

          {/* Technical Spec Sidebar */}
          <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800 text-slate-500 text-xs shadow-lg">
            <h3 className="text-slate-300 font-bold mb-4 flex items-center gap-3 font-['Orbitron'] text-xs">
              <Info size={16} className="text-pink-500" />
              SYSTEM OVERVIEW
            </h3>
            <div className="space-y-4 font-mono leading-relaxed">
              <p>
                Operating in <span className="text-pink-500 font-bold">{mode}</span> mode. Signal processing involves 7 independent logic channels (a-g).
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/60 rounded-xl border border-slate-800">
                  <span className="block text-[9px] text-slate-600 mb-1">BIT_MAP</span>
                  <span className="text-green-500 font-bold">{binaryString.split('').join('|')}</span>
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-slate-800">
                  <span className="block text-[9px] text-slate-600 mb-1">DEC_OUT</span>
                  <span className="text-pink-500 font-bold">{currentDecimal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Truth Table Overlay */}
      <AnimatePresence>
        {isTruthTableOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsTruthTableOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border-2 border-slate-800 w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-['Orbitron'] text-white">Logic Truth Table (0-9)</h2>
                <button onClick={() => setIsTruthTableOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-auto custom-scrollbar">
                <table className="w-full font-mono text-sm border-collapse">
                  <thead>
                    <tr className="text-pink-500 border-b-2 border-slate-800">
                      <th className="p-3 text-left">Digit</th>
                      <th className="p-3 text-left">Binary (abcdefg)</th>
                      <th className="p-3 text-right">Raw</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(DIGIT_MAPS).map(([digit, binary]) => (
                      <tr key={digit} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-bold text-white text-lg">{digit}</td>
                        <td className="p-3 text-green-400 tracking-widest">{binary}</td>
                        <td className="p-3 text-right text-slate-500">0x{parseInt(binary, 2).toString(16).toUpperCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-600 italic">Common cathode configuration. Mapping follows standard ISO 7-segment standard.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-12 py-10 w-full max-w-6xl flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-slate-600 gap-6 border-t border-slate-900">
        <div className="flex items-center gap-6">
          <span className="font-bold">&copy; 2024 NEONBIT SYSTEMS</span>
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5"><div className="w-1 h-1 bg-green-500 rounded-full"></div>SYNC_OK</div>
             <div className="flex items-center gap-1.5"><div className="w-1 h-1 bg-pink-500 rounded-full"></div>PWR_HIGH</div>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-slate-950/50 px-4 py-2 rounded-full border border-slate-900">
          <span className="text-pink-500 uppercase tracking-widest animate-pulse font-bold">Arcade Core Active</span>
          <span className="text-slate-700">|</span>
          <span className="hover:text-white cursor-pointer transition-colors">DOCUMENTATION</span>
          <span className="hover:text-white cursor-pointer transition-colors">API_ENDPOINTS</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
