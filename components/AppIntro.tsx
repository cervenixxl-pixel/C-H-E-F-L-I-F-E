import React, { useState, useEffect } from 'react';

const AppIntro: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Brand Reveal
    const t1 = setTimeout(() => setStage(1), 500);
    // Stage 2: Concierge Line
    const t2 = setTimeout(() => setStage(2), 1500);
    // Stage 3: Fade Out
    const t3 = setTimeout(() => setStage(3), 3200);
    // Complete
    const t4 = setTimeout(onComplete, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[200] bg-brand-dark flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out ${stage === 3 ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[120px] transition-transform duration-[4000ms] ${stage >= 1 ? 'scale-150' : 'scale-100'}`}></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo Reveal */}
        <div className={`transition-all duration-1000 transform ${stage >= 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter mb-2">
            Luxe<span className="text-brand-gold">Plate</span>
          </h1>
          <div className={`h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent mx-auto transition-all duration-1000 delay-300 ${stage >= 1 ? 'w-48' : 'w-0'}`}></div>
        </div>

        {/* Concierge Intro */}
        <div className={`mt-8 transition-all duration-1000 delay-500 transform ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-4">
            The Art of At-Home Dining
          </p>
          
          <div className="flex items-center justify-center space-x-3 text-brand-gold/80">
            <span className="w-8 h-px bg-brand-gold/30"></span>
            <span className="text-xs font-serif italic tracking-wider">featuring</span>
            <span className="w-8 h-px bg-brand-gold/30"></span>
          </div>
          
          <div className="mt-3 flex items-center justify-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></div>
            <p className="text-sm font-medium text-white tracking-wide">Executive Chef Sebastian</p>
          </div>
        </div>
      </div>

      {/* Modern Loader at Bottom */}
      <div className="absolute bottom-16 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full bg-brand-gold transition-all duration-[3500ms] ease-out ${stage >= 1 ? 'w-full' : 'w-0'}`}></div>
      </div>
    </div>
  );
};

export default AppIntro;