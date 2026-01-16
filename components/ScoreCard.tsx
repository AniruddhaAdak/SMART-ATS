
import React, { useState } from 'react';
import { SCORE_EXPLANATIONS } from '../constants';

interface ScoreCardProps {
  id: keyof typeof SCORE_EXPLANATIONS;
  label: string;
  score: number;
  weight?: number;
  color: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ id, label, score, weight, color }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.round(score || 0);

  return (
    <div className="group relative glass p-6 rounded-3xl hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic">{label}</span>
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <i className="fa-solid fa-circle-info text-[10px] text-white/10 cursor-help hover:text-emerald-500 transition-colors"></i>
            {showTooltip && (
              <div className="absolute z-[200] bottom-full left-1/2 -translate-x-1/2 mb-3 w-44 p-4 glass text-white text-[9px] font-bold rounded-2xl shadow-2xl animate-in zoom-in duration-200">
                {SCORE_EXPLANATIONS[id]}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white/10"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-baseline space-x-1">
        <span className={`text-4xl font-extrabold italic tracking-tighter ${color}`}>{percentage}</span>
        <span className={`text-[10px] font-bold opacity-30 ${color}`}>%</span>
      </div>

      <div className="mt-4 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-[2s] ease-in-out bg-current ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {weight !== undefined && (
        <div className="mt-3 text-[8px] font-bold text-white/20 uppercase tracking-widest italic">
          Impact: {(weight * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
