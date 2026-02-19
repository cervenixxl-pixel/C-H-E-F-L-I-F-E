
import React, { useState, useRef, useEffect } from 'react';
import { Chef, Menu, Dish, ImageGenConfig } from '../types';
import { generateHighQualityImage, generateMenuDescription, generateDishDescription, generateMenuCoverImage } from '../services/geminiService';
import { db } from '../services/databaseService';

interface ChefMenuManagerProps {
  chef: Chef;
  onUpdate: (updatedChef: Chef) => void;
  onGenerateTeaser?: () => void;
}

const EMPTY_DISH: Dish = { name: '', description: '', ingredients: [], allergens: [], isSignature: false, platingStyle: 'Minimalist Luxury' };

const PLATING_STYLES = [
  "Minimalist Luxury", "Rustic & Earthy", "Avant-Garde Art", "Moody Cinematic", "Bright & Fresh", "Classic Michelin", "Deconstructed Art"
];

const COMMON_ALLERGENS = [
  "Gluten", "Dairy", "Nuts", "Shellfish", "Eggs", "Soy", "Fish", "Peanuts", "Sulphites", "Mustard", "Celery", "Sesame", "Lupin", "Molluscs"
];

const SUGGESTED_INGREDIENTS = [
  "Wagyu", "Truffle", "Saffron", "Yuzu", "Caviar", "Foie Gras", "Uni", "Aged Balsamic", "Wild Mushrooms", "Sea Urchin", "Shiso", "Miso", "Kombu", "Langoustine"
];

const TagInput: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  label: string;
  suggestions?: string[];
  variant?: 'gold' | 'rose';
}> = ({ tags, onChange, placeholder, label, suggestions = [], variant = 'gold' }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = suggestions.filter(s => 
    s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  const showDropdown = isFocused && (filteredOptions.length > 0 || (inputValue && !tags.includes(inputValue)));

  const themeStyles = {
    gold: {
      tag: 'bg-brand-dark/5 text-brand-dark border-brand-dark/10 hover:bg-brand-gold/10',
      icon: 'text-brand-gold',
      ring: 'focus-within:ring-brand-gold/20 focus-within:border-brand-gold',
      quick: 'hover:bg-brand-gold/10 text-brand-dark/60'
    },
    rose: {
      tag: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100',
      icon: 'text-rose-400',
      ring: 'focus-within:ring-rose-100 focus-within:border-rose-300',
      quick: 'hover:bg-rose-100 text-rose-500'
    }
  }[variant];

  return (
    <div className="space-y-3 relative" ref={containerRef}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{label}</label>
      </div>
      
      <div 
        className={`min-h-[56px] p-2.5 bg-white border border-gray-200 rounded-2xl flex flex-wrap gap-2 transition-all duration-500 shadow-sm cursor-text ${themeStyles.ring}`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span key={i} className={`pl-3 pr-1.5 py-1.5 rounded-full text-[11px] font-bold flex items-center border transition-all animate-in zoom-in-95 duration-300 group ${themeStyles.tag}`}>
            {tag}
            <button onClick={(e) => { e.stopPropagation(); removeTag(tag); }} className="ml-2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <svg className="w-3 h-3 opacity-40 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
        <input 
          ref={inputRef} 
          type="text" 
          value={inputValue} 
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputValue) {
              e.preventDefault();
              addTag(inputValue);
            }
          }}
          className="flex-grow bg-transparent border-none outline-none text-sm py-1 font-medium placeholder:text-gray-300" 
          placeholder={tags.length === 0 ? placeholder : 'Add more...'} 
        />
      </div>

      {showDropdown && (
        <div className="absolute z-[60] top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="p-2 max-h-60 overflow-y-auto no-scrollbar">
              {filteredOptions.map((opt) => (
                <button key={opt} onMouseDown={(e) => { e.preventDefault(); addTag(opt); }} className="w-full px-5 py-3 rounded-xl hover:bg-gray-50 text-xs font-bold text-left transition-colors flex items-center justify-between group">
                  <span className="text-gray-700">{opt}</span>
                </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

const DishImageUploader: React.FC<{
    dish: Dish;
    onChange: (value?: string) => void;
    onQuickAI?: () => void;
    isGenerating?: boolean;
}> = ({ dish, onChange, onQuickAI, isGenerating = false }) => {
    if (dish.image) {
        return (
            <div className="relative w-40 h-40 rounded-3xl overflow-hidden group shadow-xl border-4 border-white bg-white flex-shrink-0">
                <img src={dish.image} className="w-full h-full object-cover" alt="Dish" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button onClick={onQuickAI} className="text-[9px] font-bold text-white uppercase tracking-widest hover:text-brand-gold transition-colors">✨ Regenerate</button>
                    <button onClick={() => onChange(undefined)} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors">Remove</button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-brand-dark/40 backdrop-blur-md rounded-lg text-[7px] text-brand-gold font-bold uppercase">AI Visual</div>
            </div>
        );
    }

    return (
        <div className="w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 gap-2 hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-all cursor-pointer group flex-shrink-0" onClick={onQuickAI}>
            {isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[8px] font-bold text-brand-gold uppercase animate-pulse">Synthesizing...</span>
                </div>
            ) : (
                <>
                    <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:bg-brand-gold/10 transition-colors">
                        <svg className="w-8 h-8 group-hover:text-brand-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] group-hover:text-brand-gold transition-colors">Generate AI Asset</span>
                </>
            )}
        </div>
    );
};

const CourseEditor: React.FC<{
  title: string;
  courseKey: string;
  dishes: Dish[];
  onUpdate: (dishes: Dish[]) => void;
  onRemoveCourse: () => void;
  dragHandle?: React.ReactNode;
}> = ({ title, courseKey, dishes, onUpdate, onRemoveCourse, dragHandle }) => {
  const [generatingDishIndex, setGeneratingDishIndex] = useState<number | null>(null);
  const [generatingWizardIndex, setGeneratingWizardIndex] = useState<number | null>(null);

  const checkApiKey = async () => {
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
        await (window as any).aistudio?.openSelectKey();
    }
  };

  const handleQuickAIGenerate = async (idx: number) => {
    const dish = dishes[idx];
    if (!dish.name) return alert("Identify the dish first.");
    await checkApiKey();
    setGeneratingDishIndex(idx);
    try {
        const prompt = `Extreme high-end culinary photography: '${dish.name}'. Context: ${dish.description}. Plating: ${dish.platingStyle}. Elements: ${dish.ingredients.join(', ')}. Cinematic lighting, Michelin star aesthetic.`;
        const aiImg = await generateHighQualityImage(prompt, { aspectRatio: "1:1", imageSize: "1K" });
        const updated = [...dishes];
        updated[idx] = { ...updated[idx], image: aiImg };
        onUpdate(updated);
    } catch (err) { alert("Visual synthesis failed."); } finally { setGeneratingDishIndex(null); }
  };

  const handleDishWizard = async (idx: number) => {
    const dish = dishes[idx];
    if (!dish.name) return alert("Please name the creation.");
    await checkApiKey();
    setGeneratingWizardIndex(idx);
    try {
        const narrative = await generateDishDescription(dish.name, dish.ingredients || []);
        const prompt = `Elite food photography: '${dish.name}'. Narrative: ${narrative}. Plating: ${dish.platingStyle}. Cinematic lighting.`;
        const aiImg = await generateHighQualityImage(prompt, { aspectRatio: "1:1", imageSize: "1K" });
        const updated = [...dishes];
        updated[idx] = { ...updated[idx], description: narrative, image: aiImg };
        onUpdate(updated);
    } catch (err) { alert("Wizard synthesis failed."); } finally { setGeneratingWizardIndex(null); }
  };

  return (
    <div className="mb-10 bg-gray-50/50 rounded-[3rem] p-10 border border-gray-100 group/course transition-all hover:bg-gray-100/50">
      <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-6">
              <div className="text-gray-300 hover:text-brand-gold transition-colors">{dragHandle}</div>
              <h4 className="font-serif font-bold text-3xl text-brand-dark tracking-tight">{title}</h4>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={() => onUpdate([...dishes, { ...EMPTY_DISH, name: 'New Creation' }])} className="text-[10px] font-bold bg-white border border-gray-200 px-6 py-3 rounded-xl hover:border-brand-gold shadow-sm transition-all uppercase tracking-widest">+ Add Dish</button>
              <button onClick={onRemoveCourse} className="text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100 px-6 py-3 rounded-xl hover:bg-rose-100 transition-all uppercase tracking-widest">Remove Stage</button>
          </div>
      </div>
      <div className="space-y-8">
          {dishes.map((dish, i) => (
              <div key={i} className={`bg-white p-10 rounded-[2.5rem] border transition-all duration-500 relative group animate-in fade-in ${dish.isSignature ? 'border-brand-gold/40 bg-brand-gold/[0.02] ring-1 ring-brand-gold/10' : 'border-gray-100 shadow-sm'}`}>
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                      <button 
                        onClick={() => handleDishWizard(i)}
                        disabled={generatingWizardIndex === i}
                        className="p-3 bg-brand-dark text-brand-gold rounded-xl hover:scale-105 transition-all shadow-lg"
                        title="Magic Synthesis (Text + Image)"
                      >
                         {generatingWizardIndex === i ? <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                      </button>
                      <button onClick={() => onUpdate(dishes.filter((_, idx) => idx !== i))} className="p-3 bg-white border border-gray-100 text-gray-300 hover:text-rose-500 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                  <div className="flex gap-12 items-start flex-col lg:flex-row">
                       <DishImageUploader dish={dish} onChange={(val) => onUpdate(dishes.map((d, idx) => idx === i ? { ...d, image: val } : d))} onQuickAI={() => handleQuickAIGenerate(i)} isGenerating={generatingDishIndex === i} />
                       <div className="flex-grow space-y-8 w-full">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div>
                                   <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Dish Identity</label>
                                   <input value={dish.name} onChange={e => onUpdate(dishes.map((d, idx) => idx === i ? { ...d, name: e.target.value } : d))} className="w-full p-4 border border-gray-100 rounded-2xl text-base font-bold focus:border-brand-gold outline-none bg-gray-50/50" />
                               </div>
                               <div>
                                   <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Plating Aesthetic</label>
                                   <select value={dish.platingStyle} onChange={e => onUpdate(dishes.map((d, idx) => idx === i ? { ...d, platingStyle: e.target.value } : d))} className="w-full p-4 border border-gray-100 rounded-2xl text-sm focus:border-brand-gold outline-none bg-gray-50/50 font-bold">
                                      {PLATING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                   </select>
                               </div>
                           </div>
                           
                           <div>
                               <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Poetic Narrative</label>
                               <textarea value={dish.description} onChange={e => onUpdate(dishes.map((d, idx) => idx === i ? { ...d, description: e.target.value } : d))} className="w-full p-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm h-24 resize-none focus:border-brand-gold outline-none italic" placeholder="The flavor journey..." />
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                               <TagInput label="Sensory Elements" tags={dish.ingredients || []} onChange={tags => onUpdate(dishes.map((d, idx) => idx === i ? { ...d, ingredients: tags } : d))} placeholder="Truffle, Wagyu..." suggestions={SUGGESTED_INGREDIENTS} />
                               <TagInput label="Allergen Profile" tags={dish.allergens || []} onChange={tags => onUpdate(dishes.map((d, idx) => idx === i ? { ...d, allergens: tags } : d))} placeholder="Gluten..." suggestions={COMMON_ALLERGENS} variant="rose" />
                           </div>
                       </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

const ChefMenuManager: React.FC<ChefMenuManagerProps> = ({ chef, onUpdate }) => {
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const activeMenu = chef.menus[activeMenuIndex];

  const handleUpdateMenu = (updatedMenu: Menu) => {
      const newMenus = [...chef.menus];
      newMenus[activeMenuIndex] = updatedMenu;
      const updatedChef = { ...chef, menus: newMenus };
      onUpdate(updatedChef);
      db.saveChef(updatedChef);
  };

  /* Added handleRemoveCourse to manage culinary stage removal */
  const handleRemoveCourse = (key: string) => {
      if (!activeMenu) return;
      const order = activeMenu.courseOrder || ['starter', 'main', 'dessert'];
      const newOrder = order.filter(k => k !== key);
      const newCourses = { ...activeMenu.courses };
      delete newCourses[key];
      handleUpdateMenu({ ...activeMenu, courses: newCourses, courseOrder: newOrder });
  };

  const checkApiKey = async () => {
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
        await (window as any).aistudio?.openSelectKey();
    }
  };

  const handleMagicCover = async () => {
    if (!activeMenu) return;
    await checkApiKey();
    setIsGeneratingCover(true);
    try {
        const cover = await generateMenuCoverImage(activeMenu.name, activeMenu.description);
        handleUpdateMenu({ ...activeMenu, coverImage: cover });
    } catch (err) { alert("Cover synthesis failed."); } finally { setIsGeneratingCover(false); }
  };

  const handleMagicDescription = async () => {
    if (!activeMenu) return;
    setIsGeneratingDescription(true);
    try {
        const narrative = await generateMenuDescription(activeMenu.name, activeMenu.courses);
        handleUpdateMenu({ ...activeMenu, description: narrative });
    } catch (err) { alert("Narrative synthesis failed."); } finally { setIsGeneratingDescription(false); }
  };

  const handleAddCustomCourse = () => {
      if (!newCourseName.trim()) return;
      const key = newCourseName.trim().toLowerCase().replace(/\s+/g, '_');
      const order = activeMenu.courseOrder || ['starter', 'main', 'dessert'];
      if (order.includes(key)) return alert("Stage identity exists.");
      handleUpdateMenu({ ...activeMenu, courses: { ...activeMenu.courses, [key]: [] }, courseOrder: [...order, key] });
      setNewCourseName('');
  };

  if (!activeMenu) return (
    <div className="p-20 text-center">
      <button onClick={() => handleUpdateMenu({ id: Math.random().toString(36).substr(2, 9), name: 'Collection I', description: '', pricePerHead: 150, courses: { starter: [], main: [], dessert: [] }, courseOrder: ['starter', 'main', 'dessert'] })} className="bg-brand-dark text-brand-gold px-16 py-5 rounded-[2rem] font-bold uppercase tracking-widest shadow-2xl">Create Collection</button>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
            {chef.menus.map((m, i) => (
                <button key={m.id} onClick={() => setActiveMenuIndex(i)} className={`whitespace-nowrap px-10 py-6 rounded-[2rem] font-bold text-xs uppercase tracking-widest transition-all border ${activeMenuIndex === i ? 'bg-brand-dark text-brand-gold border-brand-dark shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-brand-gold/30'}`}>{m.name}</button>
            ))}
            <button onClick={() => handleUpdateMenu({ id: Math.random().toString(36).substr(2, 9), name: 'New Collection', description: '', pricePerHead: 100, courses: { starter: [], main: [], dessert: [] }, courseOrder: ['starter', 'main', 'dessert'] })} className="whitespace-nowrap px-10 py-6 rounded-[2rem] font-bold text-xs uppercase tracking-widest border border-dashed border-gray-200 text-gray-300 hover:border-brand-gold hover:text-brand-gold transition-all">+ Add Portfolio</button>
        </div>

        <div className="bg-white p-12 lg:p-20 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            
            <div className="relative mb-20">
                <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
                    <div className="flex-grow w-full space-y-12">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] block mb-4">Collection Title</label>
                            <input value={activeMenu.name} onChange={e => handleUpdateMenu({...activeMenu, name: e.target.value})} className="w-full text-6xl font-serif font-bold text-brand-dark border-b border-gray-100 pb-6 focus:border-brand-gold outline-none bg-transparent" />
                        </div>
                        <div className="relative">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] block">Sensory Narrative</label>
                                <button onClick={handleMagicDescription} disabled={isGeneratingDescription} className="text-[9px] font-bold text-brand-gold hover:text-brand-dark uppercase tracking-widest flex items-center gap-2 transition-all">
                                    {isGeneratingDescription ? 'Synthesizing...' : '✨ Narrative AI'}
                                </button>
                            </div>
                            <textarea value={activeMenu.description} onChange={e => handleUpdateMenu({...activeMenu, description: e.target.value})} className="w-full p-10 bg-gray-50 rounded-[3rem] border border-gray-100 text-xl focus:border-brand-gold outline-none h-48 resize-none font-serif italic shadow-inner leading-relaxed" />
                        </div>
                    </div>
                    
                    <div className="w-full lg:w-96 flex-shrink-0 space-y-8">
                        <div className="bg-brand-light p-10 rounded-[3rem] border border-brand-gold/10 text-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] block mb-4">Price / Guest</label>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-4xl font-serif font-bold text-brand-dark">£</span>
                                <input type="number" value={activeMenu.pricePerHead} onChange={e => handleUpdateMenu({...activeMenu, pricePerHead: parseInt(e.target.value) || 0})} className="w-32 text-6xl font-serif font-bold text-brand-dark bg-transparent outline-none" />
                            </div>
                        </div>
                        <div className="relative h-64 rounded-[3rem] overflow-hidden border-2 border-dashed border-gray-200 group/cover">
                             {activeMenu.coverImage ? (
                                <>
                                    <img src={activeMenu.coverImage} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover/cover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onClick={handleMagicCover} disabled={isGeneratingCover} className="bg-white text-brand-dark px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-2xl">✨ Regenerate Hero</button>
                                    </div>
                                </>
                             ) : (
                                <button onClick={handleMagicCover} disabled={isGeneratingCover} className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gray-50 group-hover/cover:bg-brand-gold/5 transition-all">
                                    {isGeneratingCover ? <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : (
                                        <>
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-300 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Generate Collection Hero</span>
                                        </>
                                    )}
                                </button>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 border-t border-gray-50">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] block mb-6">Inject Culinary Stage</label>
                <div className="flex gap-4 max-w-2xl">
                    <input placeholder="e.g. Pre-Dessert, Palate Cleanser..." value={newCourseName} onChange={e => setNewCourseName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustomCourse()} className="flex-grow p-5 border border-gray-100 rounded-2xl text-sm font-bold focus:border-brand-gold outline-none bg-gray-50/50" />
                    <button onClick={handleAddCustomCourse} className="bg-brand-dark text-white px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl">Deploy Stage</button>
                </div>
            </div>
        </div>

        <div className="space-y-12">
             {(activeMenu.courseOrder || ['starter', 'main', 'dessert']).map((key) => (
                 <CourseEditor 
                    key={key} 
                    title={key.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    courseKey={key} 
                    dishes={activeMenu.courses[key] || []} 
                    onUpdate={(dishes) => handleUpdateMenu({...activeMenu, courses: {...activeMenu.courses, [key]: dishes}})}
                    onRemoveCourse={() => handleRemoveCourse(key)}
                    dragHandle={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>}
                 />
             ))}
        </div>
    </div>
  );
};

export default ChefMenuManager;
