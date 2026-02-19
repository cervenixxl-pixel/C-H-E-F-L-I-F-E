import React from 'react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Curating culinary excellence...", 
  fullScreen = true 
}) => {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-700" 
    : "flex flex-col items-center justify-center h-96 w-full py-12";

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center mb-12">
        {/* Decorative Outer Ring */}
        <div className="w-24 h-24 border border-brand-accent/30 rounded-full"></div>
        
        {/* Spinning Gold Ring */}
        <div className="absolute w-24 h-24 border-t-2 border-r-2 border-brand-gold/80 rounded-full animate-[spin_3s_linear_infinite]"></div>
        
        {/* Counter Spinning Inner Ring */}
        <div className="absolute w-16 h-16 border-b-2 border-l-2 border-brand-dark/20 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
        
        {/* Center Emblem with Pulse */}
        <div className="absolute flex items-center justify-center w-12 h-12 bg-brand-dark rounded-full shadow-lg animate-pulse">
             <span className="font-serif text-xl font-bold text-brand-gold pt-1">L</span>
        </div>
      </div>
      
      <div className="text-center space-y-4 max-w-xs px-4">
          <h3 className="font-serif text-2xl font-bold text-brand-dark tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-700">
            LuxePlate
          </h3>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-brand-gold to-transparent mx-auto opacity-50"></div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] animate-pulse leading-relaxed">
            {message}
          </p>
      </div>
    </div>
  );
};

export default LoadingScreen;