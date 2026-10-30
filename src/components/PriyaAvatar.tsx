import React from 'react';
import { Headphones, Sparkles } from 'lucide-react';

interface PriyaAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  isListening?: boolean;
  showBadge?: boolean;
  className?: string;
}

export const PriyaAvatar: React.FC<PriyaAvatarProps> = ({
  size = 'md',
  isSpeaking = false,
  isListening = false,
  showBadge = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      {/* Outer Pulse Ring when Speaking or Listening */}
      {(isSpeaking || isListening) && (
        <span
          className={`absolute inset-0 rounded-2xl animate-ping opacity-35 ${
            isSpeaking ? 'bg-teal-400' : 'bg-blue-500'
          }`}
        />
      )}

      {/* Main Avatar Container */}
      <div
        className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0D9488] p-0.5 shadow-md flex items-center justify-center text-white relative z-10 transition-transform duration-300`}
      >
        <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-[#102A56] via-[#1E3A6A] to-[#0D9488] flex items-center justify-center relative overflow-hidden">
          {/* Subtle light glow */}
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-400/25 rounded-full blur-xs pointer-events-none" />

          {/* Assistant Icon Illustration */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white">
            <Headphones className={`${iconSizes[size]} text-cyan-200 stroke-[2.2]`} />
          </div>

          {/* Subtle voice waves in background */}
          <div className="absolute inset-x-0 bottom-0.5 flex items-center justify-center space-x-0.5 opacity-40">
            <span className="w-0.5 h-1.5 bg-cyan-300 rounded-full" />
            <span className="w-0.5 h-2.5 bg-teal-300 rounded-full" />
            <span className="w-0.5 h-1 bg-cyan-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Online Status Beacon */}
      {showBadge && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs z-20"
          title="Priya AI: Online 24/7"
        >
          <span className="w-full h-full rounded-full bg-emerald-400 block animate-pulse" />
        </span>
      )}
    </div>
  );
};
