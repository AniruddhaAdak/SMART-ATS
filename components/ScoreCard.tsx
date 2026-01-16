
import React from 'react';

interface ScoreCardProps {
  label: string;
  score: number;
  weight?: number;
  color: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, weight, color }) => {
  const percentage = Math.round(score);
  
  return (
    <div className="group relative bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-3xl -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</span>
          {weight !== undefined && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
              {(weight * 100).toFixed(0)}% Impact
            </span>
          )}
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black tabular-nums tracking-tighter ${color}`}>{percentage}%</span>
        </div>
        
        <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
