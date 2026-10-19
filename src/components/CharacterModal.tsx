import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CharacterItem, StrokeStyle } from '../types';
import { medianToSvgPath } from '../utils/strokeService';
import { X, Play, Pause, RotateCcw, PenTool, Eraser } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CharacterModalProps {
  item: CharacterItem | null;
  onClose: () => void;
  strokeStyle: StrokeStyle;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  item,
  onClose,
  strokeStyle,
}) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState<number>(0);
  const [strokeProgress, setStrokeProgress] = useState<number>(0); // 0 to 1 along median
  const [isDone, setIsDone] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(800); // ms per stroke
  const [activeTab, setActiveTab] = useState<'animate' | 'practice'>('animate');

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const strokes = item?.strokeData?.strokes || [];
  const medians = item?.strokeData?.medians || [];
  const totalStrokes = strokes.length;
  const isSansSerif = strokeStyle === 'heiti' && medians.length === strokes.length && totalStrokes > 0;

  // Compute geometric length of each stroke's centerline median for accurate SVG dash offset brushing
  const strokeLengths = useMemo(() => {
    return medians.map((m) => {
      if (!m || m.length < 2) return 500;
      let len = 0;
      for (let i = 1; i < m.length; i++) {
        const dx = m[i][0] - m[i - 1][0];
        const dy = m[i][1] - m[i - 1][1];
        len += Math.sqrt(dx * dx + dy * dy);
      }
      return Math.ceil(len + 80);
    });
  }, [medians]);

  const animStateRef = useRef<{
    lastTime: number | null;
    phase: 'drawing' | 'stepPause' | 'fullPause';
    phaseTime: number;
    strokeIndex: number;
  }>({
    lastTime: null,
    phase: 'drawing',
    phaseTime: 0,
    strokeIndex: 0,
  });

  // Keep ref synchronized when currentStrokeIndex changes externally
  useEffect(() => {
    animStateRef.current.strokeIndex = currentStrokeIndex;
  }, [currentStrokeIndex]);

  // Reset when character item changes
  useEffect(() => {
    setCurrentStrokeIndex(0);
    setStrokeProgress(0);
    setIsDone(false);
    setIsPlaying(true);
    animStateRef.current = {
      lastTime: null,
      phase: 'drawing',
      phaseTime: 0,
      strokeIndex: 0,
    };
    clearCanvas();
  }, [item]);

  // Directional brushing animation loop
  useEffect(() => {
    if (!item || !isPlaying || totalStrokes === 0 || activeTab !== 'animate') return;

    let animFrameId: number;
    animStateRef.current.lastTime = null;

    const drawDuration = Math.max(300, Math.round(speed * 0.72));
    const stepPauseDuration = Math.max(80, Math.round(speed * 0.28));
    const fullPauseDuration = 1200;

    const tick = (time: number) => {
      if (animStateRef.current.lastTime === null) {
        animStateRef.current.lastTime = time;
      }
      const dt = Math.min(time - animStateRef.current.lastTime, 100);
      animStateRef.current.lastTime = time;

      animStateRef.current.phaseTime += dt;

      if (animStateRef.current.phase === 'drawing') {
        const rawP = Math.min(1, animStateRef.current.phaseTime / drawDuration);
        // Natural calligraphy brush easing (gentle start, swift movement, controlled finish)
        const easedP = rawP < 0.5 ? 2 * rawP * rawP : 1 - Math.pow(-2 * rawP + 2, 2) / 2;
        setStrokeProgress(easedP);

        if (animStateRef.current.phaseTime >= drawDuration) {
          setStrokeProgress(1);
          animStateRef.current.phase = 'stepPause';
          animStateRef.current.phaseTime = 0;
        }
      } else if (animStateRef.current.phase === 'stepPause') {
        if (animStateRef.current.phaseTime >= stepPauseDuration) {
          const currentIdx = animStateRef.current.strokeIndex;
          if (currentIdx < totalStrokes - 1) {
            animStateRef.current.strokeIndex = currentIdx + 1;
            animStateRef.current.phase = 'drawing';
            animStateRef.current.phaseTime = 0;
            setCurrentStrokeIndex(currentIdx + 1);
            setStrokeProgress(0);
          } else {
            animStateRef.current.phase = 'fullPause';
            animStateRef.current.phaseTime = 0;
            setIsDone(true);
          }
        }
      } else if (animStateRef.current.phase === 'fullPause') {
        if (animStateRef.current.phaseTime >= fullPauseDuration) {
          animStateRef.current.strokeIndex = 0;
          animStateRef.current.phase = 'drawing';
          animStateRef.current.phaseTime = 0;
          setIsDone(false);
          setCurrentStrokeIndex(0);
          setStrokeProgress(0);
        }
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [item, isPlaying, speed, totalStrokes, activeTab]);

  const handleRestart = () => {
    animStateRef.current = {
      lastTime: null,
      phase: 'drawing',
      phaseTime: 0,
      strokeIndex: 0,
    };
    setIsDone(false);
    setCurrentStrokeIndex(0);
    setStrokeProgress(0);
    setIsPlaying(true);
  };

  const handleJumpToStroke = (idx: number) => {
    animStateRef.current = {
      lastTime: null,
      phase: 'drawing',
      phaseTime: 0,
      strokeIndex: idx,
    };
    setIsDone(false);
    setCurrentStrokeIndex(idx);
    setStrokeProgress(0);
    setIsPlaying(true);
    setActiveTab('animate');
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!item) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${isSansSerif ? 'font-heiti' : 'font-kaiti'} text-stone-900`}>{item.char}</span>
            <div>
              <div className="text-lg font-bold text-red-600 font-mono tracking-wide">{item.pinyin}</div>
              <div className="text-xs text-stone-500">
                {t.strokesCountLabel} <span className="font-semibold text-stone-700">{item.strokeCount || totalStrokes}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
            title={t.closeBtn}
            aria-label={t.closeBtn}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('animate')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'animate'
                ? 'border-red-600 text-red-600 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Play className="w-4 h-4" />
            {t.tabAnimation}
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'practice'
                ? 'border-red-600 text-red-600 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <PenTool className="w-4 h-4" />
            {t.tabPractice}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center">
          {activeTab === 'animate' ? (
            <>
              {/* Animation Box with neutral border */}
              <div className="relative w-64 h-64 border-2 border-stone-300 rounded-xl bg-white shadow-inner flex items-center justify-center overflow-hidden">
                {/* Crisp Darker Tianzige guidelines */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#64748b" strokeWidth="1.0" strokeDasharray="3.5,2.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#64748b" strokeWidth="1.0" strokeDasharray="3.5,2.5" />
                  <line x1="0" y1="0" x2="100" y2="100" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2,2" />
                </svg>

                {/* Animated strokes with authentic directional brushing */}
                <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
                  {totalStrokes > 0 ? (
                    <>
                      {/* SVG Mask for the currently active stroke */}
                      <defs>
                        {!isDone && medians[currentStrokeIndex] && (
                          <mask id="character-brush-mask">
                            <rect x="-300" y="-300" width="1624" height="1624" fill="black" />
                            <path
                              d={medianToSvgPath(medians[currentStrokeIndex])}
                              stroke="white"
                              strokeWidth="240"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              strokeDasharray={strokeLengths[currentStrokeIndex] || 800}
                              strokeDashoffset={((1 - strokeProgress) * (strokeLengths[currentStrokeIndex] || 800))}
                            />
                          </mask>
                        )}
                      </defs>

                      <g transform="translate(7.5, 83.6) scale(0.083, -0.083)">
                        {/* Faint complete guide silhouette so learner sees the full target */}
                        {isSansSerif ? (
                          <g
                            stroke="#94a3b8"
                            strokeWidth="46"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            opacity="0.25"
                          >
                            {medians.map((m, idx) => (
                              <path key={`guide-heiti-${idx}`} d={medianToSvgPath(m)} />
                            ))}
                          </g>
                        ) : (
                          <g opacity="0.10">
                            {strokes.map((s, idx) => (
                              <path key={`guide-kaiti-${idx}`} d={s} fill="#64748b" />
                            ))}
                          </g>
                        )}

                        {/* Completed previous strokes in solid dark ink */}
                        {isSansSerif ? (
                          <g
                            stroke="#1e293b"
                            strokeWidth="46"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          >
                            {medians.slice(0, isDone ? totalStrokes : currentStrokeIndex).map((m, idx) => (
                              <path key={`done-heiti-${idx}`} d={medianToSvgPath(m)} />
                            ))}
                          </g>
                        ) : (
                          strokes.slice(0, isDone ? totalStrokes : currentStrokeIndex).map((s, idx) => (
                            <path key={`done-kaiti-${idx}`} d={s} fill="#1e293b" />
                          ))
                        )}

                        {/* Active stroke being actively brushed in in correct direction */}
                        {!isDone && strokes[currentStrokeIndex] && (
                          isSansSerif ? (
                            // Sans-serif centerline median drawing in with crisp, modern stroke width
                            <path
                              d={medianToSvgPath(medians[currentStrokeIndex])}
                              stroke="#dc2626"
                              strokeWidth="46"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              strokeDasharray={strokeLengths[currentStrokeIndex] || 800}
                              strokeDashoffset={((1 - strokeProgress) * (strokeLengths[currentStrokeIndex] || 800))}
                              opacity={strokeProgress <= 0.005 ? 0 : 1}
                            />
                          ) : (
                            // Authentic Calligraphy: brushed in along median vector path
                            <path
                              d={strokes[currentStrokeIndex]}
                              mask={strokeProgress >= 0.99 ? undefined : "url(#character-brush-mask)"}
                              fill="#dc2626"
                              opacity={strokeProgress <= 0.005 ? 0 : 1}
                            />
                          )
                        )}
                      </g>
                    </>
                  ) : (
                    <text
                      x="50"
                      y="46"
                      dominantBaseline="central"
                      textAnchor="middle"
                      fontSize="80"
                      className={`${isSansSerif ? 'font-heiti' : 'font-kaiti'} fill-stone-900`}
                    >
                      {item.char}
                    </text>
                  )}
                </svg>

                {/* Step pill */}
                <div className="absolute top-2 right-2 bg-stone-900/80 text-white text-xs px-2.5 py-0.5 rounded-full font-mono">
                  {isDone ? totalStrokes : currentStrokeIndex + 1} / {totalStrokes}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" /> {t.pauseBtn}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> {t.playBtn}
                    </>
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> {t.restartBtn}
                </button>
                <div className="flex items-center gap-2 ml-2 text-xs text-stone-500">
                  <span>{t.speedLabel}</span>
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="border border-stone-200 rounded px-2 py-1 text-xs bg-white text-stone-700 font-medium"
                  >
                    <option value={1200}>{t.slowSpeed} (0.5x)</option>
                    <option value={800}>{t.mediumSpeed} (1.0x)</option>
                    <option value={450}>{t.fastSpeed} (1.5x)</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Practice Drawing Canvas with neutral border */}
              <div className="relative w-64 h-64 border-2 border-stone-300 rounded-xl bg-white shadow-inner overflow-hidden select-none touch-none">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-45">
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#475569" strokeWidth="1.0" strokeDasharray="3.5,2.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#475569" strokeWidth="1.0" strokeDasharray="3.5,2.5" />
                  <line x1="0" y1="0" x2="100" y2="100" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2,2" />
                  {strokes.length > 0 ? (
                    isSansSerif ? (
                      <g
                        transform="translate(7.5, 83.6) scale(0.083, -0.083)"
                        stroke="#475569"
                        strokeWidth="46"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      >
                        {medians.map((m, idx) => (
                          <path key={idx} d={medianToSvgPath(m)} />
                        ))}
                      </g>
                    ) : (
                      <g transform="translate(7.5, 83.6) scale(0.083, -0.083)">
                        {strokes.map((s, idx) => (
                          <path key={idx} d={s} fill="#475569" />
                        ))}
                      </g>
                    )
                  ) : (
                    <text
                      x="50"
                      y="46"
                      dominantBaseline="central"
                      textAnchor="middle"
                      fontSize="80"
                      className={`${isSansSerif ? 'font-heiti' : 'font-kaiti'} fill-stone-700`}
                    >
                      {item.char}
                    </text>
                  )}
                </svg>

                <canvas
                  ref={canvasRef}
                  width={256}
                  height={256}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 w-full h-full cursor-crosshair z-20"
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  <Eraser className="w-4 h-4" /> {t.clearCanvasBtn}
                </button>
                <span className="text-xs text-stone-400">{t.practiceHint}</span>
              </div>
            </>
          )}

          {/* Stroke breakdown mini preview */}
          {totalStrokes > 0 && (
            <div className="w-full mt-6 pt-5 border-t border-stone-100">
              <div className="text-xs font-semibold text-stone-600 mb-2.5">
                {t.strokeSequenceLabel}
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto p-1">
                {strokes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJumpToStroke(idx)}
                    className={`w-9 h-9 border rounded-md flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer ${
                      activeTab === 'animate' && ((!isDone && currentStrokeIndex === idx) || (isDone && idx === totalStrokes - 1))
                        ? 'border-red-600 bg-red-50 shadow-xs ring-1 ring-red-500 text-red-700 font-bold'
                        : 'border-stone-200 hover:border-stone-400 bg-white text-stone-600'
                    }`}
                  >
                    <span className="text-[10px] font-mono">{idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
