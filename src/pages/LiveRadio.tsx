import React, { useRef, useState, useEffect, useCallback } from 'react';

export default function LiveRadio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [bars, setBars] = useState<number[]>(new Array(32).fill(5));
  const audioRef = useRef<HTMLAudioElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamUrl = 'https://streaming01.radiosenlinea.com.ar/8794/stream';

  const updateVisualizer = useCallback(() => {
    if (analyserRef.current) {
      const data = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(data);
      const step = Math.floor(data.length / 32);
      const newBars = [];
      for (let i = 0; i < 32; i++) {
        newBars.push(Math.max(5, (data[i * step] / 255) * 100));
      }
      setBars(newBars);
    }
    animFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.src = '';
      cancelAnimationFrame(animFrameRef.current);
      setBars(new Array(32).fill(5));
      setIsPlaying(false);
    } else {
      try {
        audio.src = streamUrl;
        audio.crossOrigin = 'anonymous';
        audio.volume = volume;

        // Set up Web Audio API visualizer
        try {
          const ctx = new AudioContext();
          const source = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          analyserRef.current = analyser;
          updateVisualizer();
        } catch {
          // Visualizer may fail due to CORS, still play audio
        }

        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('Error reproduciendo:', e);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Animate bars even when visualizer can't connect (simulated)
  useEffect(() => {
    if (!isPlaying || analyserRef.current) return;
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.max(8, Math.min(95, Math.random() * 80 + 10))));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex-grow flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full">
        {/* Station Header */}
        <div className="border-2 border-[var(--color-rock-gray)] bg-[var(--color-mine-dark)]">
          <div className="p-6 border-b border-[var(--color-rock-gray)]">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-display font-black text-3xl md:text-4xl text-[var(--color-phosphor-white)] uppercase tracking-tight">
                  RADIO PÍO XII
                </h1>
                <p className="font-mono text-sm text-[var(--color-ore-gray)] mt-1">
                  FM 99.1 MHz — CENTRO MINERO SIGLO XX, POTOSÍ
                </p>
              </div>
              <div className={`px-4 py-2 font-mono text-sm font-bold flex items-center gap-2 border-2 transition-all duration-500 ${
                isPlaying
                  ? 'text-[var(--color-mine-green)] border-[var(--color-mine-green)] shadow-[0_0_15px_rgba(74,246,38,0.3)]'
                  : 'text-[var(--color-ore-gray)] border-[var(--color-ore-gray)]'
              }`}>
                <span className={`w-3 h-3 ${isPlaying ? 'bg-[var(--color-mine-green)] animate-pulse' : 'bg-[var(--color-ore-gray)]'}`}></span>
                {isPlaying ? '● AL AIRE' : '○ EN ESPERA'}
              </div>
            </div>
          </div>

          {/* Visualizer */}
          <div className="p-4 bg-[var(--color-coal-black)] border-b border-[var(--color-rock-gray)]">
            <div className="h-32 flex items-end gap-[2px] px-2">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 transition-all duration-75"
                  style={{
                    height: `${h}%`,
                    background: h > 70
                      ? 'var(--color-radio-red)'
                      : h > 40
                        ? 'var(--color-amber-dial)'
                        : 'var(--color-mine-green)',
                    opacity: isPlaying ? 0.9 : 0.2,
                    boxShadow: isPlaying && h > 50 ? `0 0 6px ${h > 70 ? 'rgba(230,25,25,0.5)' : 'rgba(255,170,0,0.4)'}` : 'none'
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-[var(--color-ore-gray)] mt-2 px-2">
              <span>100Hz</span>
              <span>1kHz</span>
              <span>10kHz</span>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 space-y-6">
            <button
              onClick={togglePlay}
              className={`w-full py-5 font-display font-black text-2xl uppercase tracking-wider transition-all duration-300 border-2 ${
                isPlaying
                  ? 'bg-[var(--color-radio-red)] text-white border-[var(--color-radio-red)] hover:bg-transparent hover:text-[var(--color-radio-red)]'
                  : 'bg-[var(--color-phosphor-white)] text-[var(--color-coal-black)] border-[var(--color-phosphor-white)] hover:bg-[var(--color-amber-dial)] hover:border-[var(--color-amber-dial)]'
              }`}
            >
              {isPlaying ? '■  DETENER TRANSMISIÓN' : '▶  ESCUCHAR EN VIVO'}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-[var(--color-ore-gray)] w-20">VOL {Math.round(volume * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-grow h-2 accent-[var(--color-amber-dial)] bg-[var(--color-rock-gray)] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="mt-6 border border-[var(--color-rock-gray)] bg-[var(--color-mine-dark)] p-6">
          <h2 className="font-mono text-sm text-[var(--color-radio-red)] font-bold mb-3">[ INFORMACIÓN DE LA EMISORA ]</h2>
          <div className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div><span className="text-[var(--color-ore-gray)]">FRECUENCIA:</span> <span className="text-[var(--color-phosphor-white)]">FM 99.1 MHz</span></div>
            <div><span className="text-[var(--color-ore-gray)]">UBICACIÓN:</span> <span className="text-[var(--color-phosphor-white)]">Siglo XX, Potosí</span></div>
            <div><span className="text-[var(--color-ore-gray)]">FUNDACIÓN:</span> <span className="text-[var(--color-phosphor-white)]">1959</span></div>
            <div><span className="text-[var(--color-ore-gray)]">TIPO:</span> <span className="text-[var(--color-phosphor-white)]">Comunitaria</span></div>
          </div>
        </div>

        <audio ref={audioRef} preload="none" className="hidden" />
      </div>
    </div>
  );
}
