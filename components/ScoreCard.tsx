
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
  const isUp = percentage > 50;

  return (
    <div className="group relative bg-white p-5 rounded-3xl border border-stone-100 hover:border-emerald-200 transition-all duration-500 ease-out">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</span>
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <i className="fa-solid fa-info-circle text-[10px] text-stone-200 cursor-help hover:text-emerald-500 transition-colors"></i>
            {showTooltip && (
              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-stone-900 text-white text-[9px] font-bold rounded-2xl shadow-xl animate-in zoom-in duration-200">
                {SCORE_EXPLANATIONS[id]}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-900"></div>
              </div>
            )}
          </div>
        </div>
        <div className={`flex items-center text-[9px] font-black ${isUp ? 'text-emerald-500' : 'text-orange-500'}`}>
          <i className={`fa-solid fa-arrow-${isUp ? 'up' : 'down'} mr-0.5`}></i>
          {Math.floor(Math.random() * 4) + 1}%
        </div>
      </div>

      <div className="flex items-baseline space-x-1">
        <span className={`text-3xl font-black italic tracking-tighter ${color}`}>{percentage}</span>
        <span className={`text-[10px] font-bold opacity-30 ${color}`}>%</span>
      </div>

      <div className="mt-3 h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-stone-900 transition-all duration-[1.5s] ease-in-out group-hover:bg-emerald-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {weight !== undefined && (
        <div className="mt-2 text-[8px] font-black text-stone-300 uppercase tracking-widest">
          Weight: {(weight * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default ScoreCard;
