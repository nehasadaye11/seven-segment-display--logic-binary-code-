
import React from 'react';
import { motion } from 'framer-motion';
import { COLOR_PALETTE } from '../constants';

interface SevenSegmentProps {
  binary: string; // 7 bits 'abcdefg'
  showLabels?: boolean;
}

const SevenSegment: React.FC<SevenSegmentProps> = ({ binary, showLabels = true }) => {
  const getSegmentColor = (index: number) => {
    return binary[index] === '1' ? COLOR_PALETTE.active : COLOR_PALETTE.inactive;
  };

  const getSegmentShadow = (index: number) => {
    return binary[index] === '1' ? COLOR_PALETTE.activeGlow : 'none';
  };

  const segments = [
    { id: 'a', path: 'M 20 10 L 80 10 L 90 20 L 80 30 L 20 30 L 10 20 Z', index: 0 },
    { id: 'b', path: 'M 85 15 L 95 25 L 95 85 L 85 95 L 75 85 L 75 25 Z', index: 1 },
    { id: 'c', path: 'M 85 105 L 95 115 L 95 175 L 85 185 L 75 175 L 75 115 Z', index: 2 },
    { id: 'd', path: 'M 20 170 L 80 170 L 90 180 L 80 190 L 20 190 L 10 180 Z', index: 3 },
    { id: 'e', path: 'M 15 105 L 25 115 L 25 175 L 15 185 L 5 175 L 5 115 Z', index: 4 },
    { id: 'f', path: 'M 15 15 L 25 25 L 25 85 L 15 95 L 5 85 L 5 25 Z', index: 5 },
    { id: 'g', path: 'M 20 90 L 80 90 L 90 100 L 80 110 L 20 110 L 10 100 Z', index: 6 },
  ];

  const labelPositions = {
    a: { x: 50, y: 20 },
    b: { x: 85, y: 55 },
    c: { x: 85, y: 145 },
    d: { x: 50, y: 180 },
    e: { x: 15, y: 145 },
    f: { x: 15, y: 55 },
    g: { x: 50, y: 100 },
  };

  return (
    <div className="relative flex items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-2xl">
      <svg width="220" height="380" viewBox="0 0 100 200" className="drop-shadow-lg overflow-visible">
        {segments.map((seg) => (
          <g key={seg.id}>
            <motion.path
              initial={false}
              animate={{
                fill: getSegmentColor(seg.index),
                filter: binary[seg.index] === '1' ? `drop-shadow(0 0 8px ${COLOR_PALETTE.active})` : 'none'
              }}
              transition={{ duration: 0.25 }}
              d={seg.path}
              className="cursor-help"
            />
            {showLabels && (
              <text
                x={labelPositions[seg.id as keyof typeof labelPositions].x}
                y={labelPositions[seg.id as keyof typeof labelPositions].y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[8px] font-bold pointer-events-none transition-colors duration-300 ${binary[seg.index] === '1' ? 'fill-white' : 'fill-slate-600'}`}
              >
                {seg.id}
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-pink-500/50 rounded-tl-2xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-500/50 rounded-tr-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-500/50 rounded-bl-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500/50 rounded-br-2xl pointer-events-none"></div>
    </div>
  );
};

export default SevenSegment;
