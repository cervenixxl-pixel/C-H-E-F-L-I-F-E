
import React, { useState, useEffect } from 'react';
import { Menu, Dish } from '../types';
import { generateMenuDescription } from '../services/geminiService';

interface MenuDisplayProps {
  menu: Menu;
  onBook: (menu: Menu) => void;
  onUpdateMenu?: (menu: Menu) => void;
}

const ALLERGEN_DESCRIPTIONS: Record<string, string> = {
  "Gluten": "Found in wheat, barley, and rye. Present in bread, pasta, and many sauces.",
  "Dairy": "Milk-based products. Includes lactose and milk proteins.",
  "Nuts": "Tree nuts like almonds, walnuts, and cashews.",
  "Shellfish": "Includes crustaceans and molluscs.",
  "Eggs": "Poultry eggs.",
  "Soy": "Derived from soybeans.",
  "Fish": "All fin fish.",
  "Peanuts": "Legumes that grow underground.",
  "Sulphites": "Preservatives used in dried fruits and wine.",
  "Mustard": "Seeds, powder, or liquid mustard.",
  "Celery": "Includes stalks, seeds, and celeriac.",
  "Sesame": "Seeds and oils.",
  "Lupin": "A legume flour.",
  "Molluscs": "Includes squid, octopus, and oysters."
};

const formatCourseTitle = (key: string) => {
    return key.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const ImageWithLoad: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    return (
        <div className={`relative overflow-hidden bg-gray-50 ${className}`}>
            {status === 'loading' && (
                <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-100 border-t-brand-gold rounded-full animate-spin"></div>
                </div>
            )}
            <img 
                src={src} 
                alt={alt} 
                className={`w-full h-full object-cover transition-all duration-[2000ms] ease-out ${status === 'loaded' ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl'}`}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
            />
        </div>
    );
};

const DishDetailModal: React.FC<{ dish: Dish; onClose: () => void }> = ({ dish, onClose }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 md:p-12">
            <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-3xl animate-in fade-in duration-700" onClick={onClose}></div>
            <div className="relative bg-white rounded-[4rem] shadow-2xl w-full max-w-6xl h-full max-h-[85vh] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-700 border border-white/20">
                 
                 <div className="relative h-96 lg:h-auto lg:w-[55%] flex-shrink-0 group overflow-hidden bg-gray-100">
                     {dish.image ? (
                        <ImageWithLoad src={dish.image} alt={dish.name} className="w-full h-full group-hover:scale-105 transition-transform duration-[4000ms]" />
                     ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center">
                             <span className="text-9xl mb-8 opacity-[0.03] select-none font-serif font-bold uppercase tracking-tighter">Culinary Asset</span>
                         </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                     <div className="absolute bottom-12 left-12 z-10 space-y-6">
                        {dish.image && (
                            <span className="inline-flex items-center gap-3 bg-brand-gold/10 backdrop-blur-xl border border-brand-gold/30 text-brand-gold text-[10px] font-bold px-5 py-2.5 rounded-2xl uppercase tracking-[0.3em] shadow-2xl animate-in slide-in-from-left duration-1000">
                                <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]"></span>
                                AI-Visualized Composition
                            </span>
                        )}
                        <h3 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter leading-none max-w-xl">{dish.name}</h3>
                     </div>
                 </div>

                 <div className="p-12 lg:p-24 flex-grow flex flex-col overflow-y-auto no-scrollbar relative bg-white">
                    <button onClick={onClose} className="absolute top-12 right-12 p-4 bg-gray-50 hover:bg-brand-dark hover:text-white rounded-full transition-all duration-500 shadow-sm z-50"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    
                    <div className="space-y-20 my-auto">
                        <div className="relative">
                            <div className="absolute -left-12 top-0 bottom-0 w-1 bg-brand-gold/20 rounded-full"></div>
                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em] block mb-8">Executive Narrative</span>
                            <p className="text-gray-700 leading-[1.8] text-2xl md:text-3xl italic font-serif">"{dish.description || 'A unique culinary expression by the chef...'}"</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.5em] flex items-center gap-4">Composition <div className="h-px bg-gray-100 flex-grow"></div></h4>
                                <div className="flex flex-wrap gap-4">
                                    {dish.ingredients.map((ing, i) => (
                                        <span key={i} className="px-6 py-3 bg-brand-light border border-gray-100 rounded-2xl text-[10px] font-bold text-brand-dark uppercase tracking-widest hover:border-brand-gold/40 transition-all cursor-default shadow-sm">{ing}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.5em] flex items-center gap-4">Allergens <div className="h-px bg-gray-100 flex-grow"></div></h4>
                                <div className="flex flex-wrap gap-3">
                                    {dish.allergens.length ? dish.allergens.map((alg, i) => (
                                        <div key={i} className="group relative">
                                            <span className="px-5 py-3 bg-orange-50 border border-orange-100 text-orange-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest cursor-help transition-all hover:bg-orange-100">{alg}</span>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 bg-brand-dark text-white rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[9px] leading-relaxed z-[130]">
                                                {ALLERGEN_DESCRIPTIONS[alg] || 'Standard food sensitivity protocol applies.'}
                                            </div>
                                        </div>
                                    )) : <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">Pure Creation</span>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-20 border-t border-gray-50 flex items-center justify-between text-gray-400">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-brand-dark rounded-2xl flex items-center justify-center text-brand-gold font-serif font-bold text-3xl shadow-2xl">L</div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-dark">Validated Asset</p>
                                    <p className="text-[9px] font-medium uppercase tracking-[0.2em] opacity-40">Portfolio Reference: #{Math.random().toString(36).substr(2, 5).toUpperCase()}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">LuxePlate Standard Excellence</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

const CourseSection: React.FC<{ title: string; dishes: Dish[]; onViewDetails: (dish: Dish) => void; }> = ({ title, dishes, onViewDetails }) => (
  <div className="mb-24">
    <div className="flex items-center gap-6 mb-12">
        <h5 className="text-[10px] font-bold uppercase tracking-[0.6em] text-brand-gold whitespace-nowrap">{title}</h5>
        <div className="h-px bg-brand-gold/20 flex-grow"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      {dishes.map((dish, idx) => (
        <div key={idx} className="flex flex-col group cursor-pointer" onClick={() => onViewDetails(dish)}>
           <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-gray-50 mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700 border border-gray-100">
               {dish.image ? (
                   <ImageWithLoad src={dish.image} alt={dish.name} className="w-full h-full group-hover:scale-110 group-hover:rotate-1" />
               ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 group-hover:bg-brand-gold/5 transition-colors">
                        <span className="text-7xl opacity-[0.05] group-hover:opacity-10 transition-all font-serif">🍽️</span>
                   </div>
               )}
               
               {dish.image && (
                 <div className="absolute top-6 left-6 bg-brand-dark/30 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0 shadow-2xl">
                    <span className="text-[8px] font-bold text-brand-gold uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse"></span>
                        AI Visual
                    </span>
                 </div>
               )}

               {dish.isSignature && <div className="absolute top-6 right-6 bg-brand-gold text-brand-dark text-[9px] font-bold px-4 py-1.5 rounded-xl shadow-2xl uppercase tracking-widest border border-white/20">Chef Signature</div>}
               <div className="absolute inset-0 bg-brand-dark/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                   <span className="text-white text-[9px] font-bold uppercase tracking-[0.4em] bg-white/10 backdrop-blur-2xl px-8 py-4 rounded-full border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-700">Explore Detail</span>
               </div>
           </div>
           <div className="space-y-3 px-2">
               <h6 className="text-gray-900 font-bold text-xl leading-tight group-hover:text-brand-gold transition-colors tracking-tight">{dish.name}</h6>
               <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed italic font-serif opacity-80 group-hover:opacity-100 transition-opacity">"{dish.description || 'A proprietary blend of seasonal elegance...'}"</p>
           </div>
        </div>
      ))}
    </div>
  </div>
);

const MenuDisplay: React.FC<MenuDisplayProps> = ({ menu, onBook, onUpdateMenu }) => {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayText, setDisplayText] = useState(menu.description || '');
  const courseOrder = menu.courseOrder || ['starter', 'main', 'dessert'];

  useEffect(() => {
    setDisplayText(menu.description || '');
  }, [menu.description]);

  const handleMagicNarrative = async () => {
    if (!onUpdateMenu) return;
    setIsGenerating(true);
    try {
      const narrative = await generateMenuDescription(menu.name, menu.courses);
      let currentIdx = 0;
      setDisplayText('');
      const interval = setInterval(() => {
        if (currentIdx < narrative.length) {
          setDisplayText(narrative.substring(0, currentIdx + 1));
          currentIdx++;
        } else {
          clearInterval(interval);
          onUpdateMenu({ ...menu, description: narrative });
        }
      }, 8);
    } catch (err) { alert("Narrative synthesis failed."); } finally { setIsGenerating(false); }
  };

  return (
    <>
        <div className="bg-white border border-gray-100 rounded-[4rem] overflow-hidden shadow-sm flex flex-col group/menu hover:shadow-2xl transition-all duration-1000 relative">
            
            {menu.coverImage && (
                <div className="relative h-[450px] w-full overflow-hidden">
                    <ImageWithLoad src={menu.coverImage} alt={menu.name} className="w-full h-full scale-105 group-hover/menu:scale-100 transition-transform duration-[6000ms]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/30"></div>
                    <div className="absolute top-12 left-12">
                         <span className="bg-white/10 backdrop-blur-2xl text-white text-[9px] font-bold px-6 py-2 rounded-full border border-white/20 shadow-2xl uppercase tracking-[0.4em]">Curated Collection</span>
                    </div>
                </div>
            )}

            <div className={`p-10 md:p-20 relative z-10 ${menu.coverImage ? '-mt-48' : ''}`}>
                <div className="mb-20 flex flex-col lg:flex-row justify-between items-start gap-12">
                    <div className="max-w-3xl w-full space-y-10">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <h4 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark group-hover/menu:text-brand-gold transition-all duration-700 leading-[0.9] tracking-tighter">{menu.name}</h4>
                            {onUpdateMenu && (
                                <button onClick={handleMagicNarrative} disabled={isGenerating} className="flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-dark transition-all shadow-xl disabled:opacity-50">
                                    {isGenerating ? <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : '✨ Enhance Strategy'}
                                </button>
                            )}
                        </div>
                        
                        {(displayText || isGenerating) && (
                            <div className="relative">
                                <div className={`absolute -left-10 top-0 bottom-0 w-1 bg-brand-gold/30 rounded-full ${isGenerating ? 'animate-pulse' : ''}`}></div>
                                {isGenerating && !displayText ? (
                                    <div className="space-y-4 max-w-xl">
                                        <div className="h-5 w-full bg-gradient-to-r from-brand-gold/5 via-brand-gold/20 to-brand-gold/5 animate-shimmer rounded-full"></div>
                                        <div className="h-5 w-4/5 bg-gradient-to-r from-brand-gold/5 via-brand-gold/20 to-brand-gold/5 animate-shimmer rounded-full"></div>
                                    </div>
                                ) : (
                                    <p className="text-gray-700 text-2xl md:text-3xl leading-[1.6] font-serif italic animate-in fade-in duration-1000 max-w-3xl">"{displayText}"</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="lg:text-right bg-brand-dark p-10 rounded-[3rem] shadow-2xl border border-white/5 group/price hover:scale-105 transition-transform duration-700 w-full lg:w-auto">
                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em] block mb-4">Investment</span>
                        <div className="flex items-baseline gap-2 justify-center lg:justify-end">
                            <span className="text-6xl font-serif font-bold text-white leading-none">£{menu.pricePerHead}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">/pp</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {courseOrder.map(key => menu.courses[key]?.length > 0 && (
                        <CourseSection key={key} title={formatCourseTitle(key)} dishes={menu.courses[key]} onViewDetails={setSelectedDish} />
                    ))}
                </div>
            </div>

            <div className="p-12 bg-gray-50/50 backdrop-blur-2xl border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between z-30 gap-10">
                <div className="flex items-center gap-12">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-3">Estimated GTV</span>
                        <span className="font-serif font-bold text-5xl text-brand-dark tracking-tighter">£{(menu.pricePerHead * 6).toLocaleString()}</span>
                    </div>
                    <div className="w-px h-16 bg-gray-200 hidden sm:block"></div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] leading-relaxed max-w-[120px]">Projection based on 6-Guest Standard</div>
                </div>
                <button onClick={() => onBook(menu)} className="w-full sm:w-auto bg-brand-dark hover:bg-black text-brand-gold font-bold py-6 px-20 rounded-[2.5rem] transition-all uppercase tracking-[0.4em] text-[10px] shadow-2xl hover:-translate-y-1 active:scale-95 border border-brand-gold/30">
                    Secure This Narrative
                </button>
            </div>
        </div>

        {selectedDish && <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />}
        <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            .animate-shimmer { background-size: 200% 100%; animation: shimmer 2s infinite linear; }
        `}} />
    </>
  );
};

export default MenuDisplay;
