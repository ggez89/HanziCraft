import React, { useState, useEffect, useRef } from 'react';
import { CharacterItem, StrokeStyle } from '../types';
import { medianToSvgPath } from '../utils/strokeService';
import { X, Play, Pause, RotateCcw, PenTool, Eraser } from 'lucide-react';

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
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(800); // ms per stroke
  const [activeTab, setActiveTab] = useState<'animate' | 'practice'>('animate');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const strokes = item?.strokeData?.strokes || [];
  const medians = item?.strokeData?.medians || [];
  const totalStrokes = strokes.length;

  // Animation loop
  useEffect(() => {
    if (!item || !isPlaying || totalStrokes === 0) return;

    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev >= totalStrokes) {
          return 0;
        }
        return prev + 1;
      });
    }, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item, isPlaying, currentStep, speed, totalStrokes]);

  // Reset when item changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    clearCanvas();
  }, [item]);

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
            <span className="text-3xl font-bold font-kaiti text-stone-900">{item.char}</span>
            <div>
              <div className="text-lg font-bold text-red-600 font-mono tracking-wide">{item.pinyin}</div>
              <div className="text-xs text-stone-500">
                Strokes: <span className="font-semibold text-stone-700">{item.strokeCount || totalStrokes}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
            title="Close"
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
            Stroke Order Animation
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
            Handwriting Canvas
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center">
          {activeTab === 'animate' ? (
            <>
              {/* Animation Box with neutral border */}
              <div className="relative w-64 h-64 border-2 border-stone-300 rounded-xl bg-white shadow-inner flex items-center justify-center overflow-hidden">
                {/* Neutral Tianzige guidelines */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="0" y1="0" x2="100" y2="100" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                </svg>

                {/* Animated strokes */}
                <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
                  {totalStrokes > 0 ? (
                    <g transform="translate(12, 87) scale(0.074, -0.074)">
                      {strokes.slice(0, currentStep).map((s, idx) => (
                        <path
                          key={idx}
                          d={s}
                          fill={idx === currentStep - 1 ? '#dc2626' : '#1e293b'}
                        />
                      ))}
                    </g>
                  ) : (
                    <text
                      x="50"
                      y="54"
                      dominantBaseline="central"
                      textAnchor="middle"
                      fontSize="68"
                      className="font-kaiti fill-stone-900"
                    >
                      {item.char}
                    </text>
                  )}
                </svg>

                {/* Step pill */}
                <div className="absolute top-2 right-2 bg-stone-900/80 text-white text-xs px-2.5 py-0.5 rounded-full font-mono">
                  {currentStep} / {totalStrokes}
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
                      <Pause className="w-4 h-4" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Play
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(0);
                    setIsPlaying(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Replay
                </button>
                <div className="flex items-center gap-2 ml-2 text-xs text-stone-500">
                  <span>Speed:</span>
                  <select
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="border border-stone-200 rounded px-2 py-1 text-xs bg-white text-stone-700 font-medium"
                  >
                    <option value={1200}>Slow (0.5x)</option>
                    <option value={800}>Normal (1.0x)</option>
                    <option value={450}>Fast (1.5x)</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Practice Drawing Canvas with neutral border */}
              <div className="relative w-64 h-64 border-2 border-stone-300 rounded-xl bg-white shadow-inner overflow-hidden select-none touch-none">
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3,3" />
                  <line x1="0" y1="0" x2="100" y2="100" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="100" y1="0" x2="0" y2="100" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="2,2" />
                  {strokes.length > 0 ? (
                    <g transform="translate(12, 87) scale(0.074, -0.074)">
                      {strokes.map((s, idx) => (
                        <path key={idx} d={s} fill="#64748b" />
                      ))}
                    </g>
                  ) : (
                    <text
                      x="50"
                      y="54"
                      dominantBaseline="central"
                      textAnchor="middle"
                      fontSize="68"
                      className="font-kaiti fill-stone-500"
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
                  <Eraser className="w-4 h-4" /> Clear Canvas
                </button>
                <span className="text-xs text-stone-400">Trace with mouse or touch</span>
              </div>
            </>
          )}

          {/* Stroke breakdown mini preview */}
          {totalStrokes > 0 && (
            <div className="w-full mt-6 pt-5 border-t border-stone-100">
              <div className="text-xs font-semibold text-stone-600 mb-2.5">
                Stroke Sequence (click to jump to step):
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto p-1">
                {strokes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentStep(idx + 1);
                      setIsPlaying(false);
                      setActiveTab('animate');
                    }}
                    className={`w-9 h-9 border rounded-md flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer ${
                      currentStep === idx + 1
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
