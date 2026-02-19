
import React, { useState, useRef, useEffect } from 'react';
import { Chef, Menu, MenuRecommendation, User, Dish } from '../types';
import BookingCalendar from './BookingCalendar';
import MenuDisplay from './MenuDisplay';

interface ChefProfileProps {
  chef: Chef;
  currentUser: User | null;
  guestCount: number;
  isFavorite: boolean;
  bookedDates: Date[];
  bookingDate: Date | null;
  bookingTime: string | null;
  onSetBookingDate: (date: Date | null) => void;
  onSetBookingTime: (time: string | null) => void;
  onBack: () => void;
  onToggleFavorite: (e: React.MouseEvent, chef: Chef) => void;
  onBookMenu: (menu: Menu) => void;
  similarMenus: MenuRecommendation[];
  loadingSimilar: boolean;
  onSelectSimilar: (rec: MenuRecommendation) => void;
  onUpdateChef?: (chef: Chef) => void;
  autoScroll?: boolean;
}

const PRESTIGE_KEYWORDS = [
  'Michelin', 'Fine Dining', 'Gastronomy', 'Bespoke', 'Sustainable', 
  'Provenance', 'Seasonal', 'Artisanal', 'Sommelier', 'Patisserie', 
  'Heritage', 'Organic', 'Foraged', 'Molecular', 'Farm-to-table',
  'Master', 'Excellence', 'Technique', 'Overtures', 'Narrative'
];

const ImageWithLoad: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    return (
        <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
            {status === 'loading' && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-gold rounded-full animate-spin"></div>
                </div>
            )}
            <img 
                src={src} 
                alt={alt} 
                className={`w-full h-full object-cover transition-opacity duration-700 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
            />
        </div>
    );
};

const VideoPlayerOverlay: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-500">
            <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-4 z-20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(212,175,55,0.3)] bg-black relative border border-white/10">
                <video src={src} controls autoPlay className="w-full h-full" />
            </div>
        </div>
    );
};

const ChefProfile: React.FC<ChefProfileProps> = ({
  chef,
  currentUser,
  guestCount,
  isFavorite,
  bookedDates,
  bookingDate,
  bookingTime,
  onSetBookingDate,
  onSetBookingTime,
  onBack,
  onToggleFavorite,
  onBookMenu,
  onUpdateChef,
  autoScroll = false
}) => {
  const [isPlayingTeaser, setIsPlayingTeaser] = useState(false);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = currentUser && currentUser.id === chef.id && onUpdateChef;

  const scrollToAvailability = () => {
      if (availabilityRef.current) {
          availabilityRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  useEffect(() => {
    if (autoScroll) {
        // Small delay to ensure render is complete and layout is stable
        setTimeout(scrollToAvailability, 500);
    }
  }, [autoScroll]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUpdateChef) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onUpdateChef({ ...chef, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const highlightText = (text: string): React.ReactNode[] => {
    if (!text) return [];
    let parts: React.ReactNode[] = [text];
    
    PRESTIGE_KEYWORDS.forEach(keyword => {
      const newParts: React.ReactNode[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const regex = new RegExp(`(${keyword})`, 'gi');
          const split = part.split(regex);
          split.forEach((s, i) => {
            if (s.toLowerCase() === keyword.toLowerCase()) {
              newParts.push(
                <span key={`${keyword}-${i}`} className="text-brand-dark font-bold bg-brand-gold/5 px-1 rounded-sm border-b border-brand-gold/40 transition-colors hover:bg-brand-gold/15">
                    {s}
                </span>
              );
            } else if (s !== '') {
              newParts.push(s);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });
    return parts;
  };

  const firstDot = chef.bio.indexOf('.');
  const leadStatement = firstDot !== -1 ? chef.bio.substring(0, firstDot + 1) : chef.bio;
  const remainingBio = firstDot !== -1 ? chef.bio.substring(firstDot + 1).trim() : '';
  
  const minSpend = chef.minSpend || 0;
  const estimatedMinSpendForParty = guestCount * (chef.minPrice || 0);
  const showMinSpendWarning = minSpend > 0 && estimatedMinSpendForParty < minSpend;

  return (
    <div className="pb-32 min-h-screen bg-brand-light animate-in fade-in duration-500">
        <div className="relative h-[50vh] md:h-[65vh] w-full group overflow-hidden">
            <ImageWithLoad src={chef.imageUrl} alt={chef.name} className="w-full h-full transition-transform duration-[2000ms] group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-brand-light"></div>
            
            <button onClick={onBack} className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-xl rounded-full shadow-2xl z-20 hover:bg-white hover:text-brand-dark transition-all border border-white/20 group/btn">
                <svg className="w-6 h-6 transform transition-transform group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            
            <button onClick={(e) => onToggleFavorite(e, chef)} className="absolute top-8 right-8 p-3 bg-white/20 backdrop-blur-xl rounded-full shadow-2xl z-20 hover:scale-110 transition-all border border-white/20">
                <svg className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </button>
            
            {chef.teaserVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <button 
                        onClick={() => setIsPlayingTeaser(true)}
                        className="pointer-events-auto bg-brand-gold text-brand-dark px-12 py-6 rounded-[2rem] font-bold shadow-2xl hover:scale-105 hover:bg-white active:scale-95 transition-all flex items-center space-x-4 uppercase tracking-[0.2em] text-sm group/play"
                    >
                        <div className="w-10 h-10 bg-brand-dark rounded-full flex items-center justify-center text-brand-gold group-hover/play:scale-110 transition-transform">
                            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                        </div>
                        <span>Experience the Craft</span>
                    </button>
                </div>
            )}
            
            <div className="absolute bottom-12 left-8 right-8 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="animate-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center space-x-3 mb-4">
                            {chef.badges.map((b, i) => (
                                <span key={i} className="px-3 py-1 bg-brand-gold text-brand-dark text-[10px] font-bold uppercase tracking-widest rounded-lg">{b}</span>
                            ))}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-brand-dark tracking-tighter">{chef.name}</h1>
                        <p className="text-gray-500 mt-4 text-xl font-medium flex items-center"><svg className="w-6 h-6 mr-2 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>{chef.location}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
            <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border border-brand-gold/10 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-20">
                        <section className="relative">
                            <div className="absolute -top-10 -left-6 text-brand-gold/10 pointer-events-none">
                                <svg className="w-24 h-24 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 14.896 15.877 12.157 18.5 10.5V10.5C18.887 10.258 19.354 10.125 19.846 10.125C21.036 10.125 22 11.089 22 12.279V12.279C22 12.716 21.868 13.14 21.621 13.497L19.857 16.052C19.464 16.627 19.25 17.305 19.25 18V21H14.017ZM4.017 21L4.017 18C4.017 14.896 5.877 12.157 8.5 10.5V10.5C8.887 10.258 9.354 10.125 9.846 10.125C11.036 10.125 12 11.089 12 12.279V12.279C12 12.716 11.868 13.14 11.621 13.497L9.857 16.052C9.464 16.627 9.25 17.305 9.25 18V21H4.017Z" /></svg>
                            </div>
                            
                            <h2 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                                <span className="whitespace-nowrap">Philosophy & Vision</span>
                                <div className="h-px bg-brand-gold/20 flex-grow"></div>
                            </h2>
                            
                            <div className="flex gap-10">
                                <div className="hidden md:block w-px bg-gradient-to-b from-brand-gold/40 to-transparent self-stretch mt-3"></div>
                                <div className="space-y-12 flex-grow">
                                    <div className="relative">
                                        <p className="text-3xl md:text-4xl font-serif text-brand-dark leading-[1.3] tracking-tight italic">
                                            "{highlightText(leadStatement)}"
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <p className="text-gray-600 leading-[2] text-lg font-normal first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:mr-4 first-letter:float-left first-letter:text-brand-dark first-letter:mt-2">
                                            {highlightText(remainingBio)}
                                        </p>
                                        <div className="clear-both"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-20 flex flex-col md:flex-row items-center gap-10 bg-brand-light p-10 rounded-[3rem] border border-brand-gold/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                                <div className="relative flex-shrink-0 group/avatar">
                                    <div className="absolute -inset-2 bg-brand-gold/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                    <img 
                                        src={chef.imageUrl} 
                                        alt={chef.name} 
                                        className="w-44 h-44 object-cover rounded-[2.5rem] shadow-2xl border-4 border-white relative z-10 transition-transform duration-700 group-hover:scale-105" 
                                    />
                                    
                                    {canEdit && (
                                      <>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[2.5rem] cursor-pointer backdrop-blur-[2px]"
                                            title="Click to manually update your profile portrait"
                                        >
                                            <div className="text-white flex flex-col items-center transform translate-y-4 group-hover/avatar:translate-y-0 transition-transform duration-500">
                                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Update Portrait</span>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -top-3 -right-3 bg-white shadow-xl p-2 rounded-full border border-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-white transition-all z-30"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        </button>
                                      </>
                                    )}

                                    <div className="absolute -bottom-3 -right-3 bg-brand-gold text-brand-dark px-4 py-1.5 rounded-xl text-[10px] font-bold shadow-xl border-2 border-white z-20 pointer-events-none">
                                        ELITE TALENT
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] mb-3">Principal Orchestrator</p>
                                    <h3 className="text-4xl font-serif font-bold text-brand-dark mb-6 leading-none">{chef.name}</h3>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-8">
                                        <div className="flex flex-col items-center md:items-start">
                                            <span className="text-brand-dark font-serif font-bold text-2xl leading-none">{chef.yearsExperience}+</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Years Expertise</span>
                                        </div>
                                        <div className="w-px h-8 bg-brand-gold/20 hidden md:block"></div>
                                        <div className="flex flex-col items-center md:items-start">
                                            <span className="text-brand-dark font-serif font-bold text-2xl leading-none">{chef.eventsCount}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Hosted Galas</span>
                                        </div>
                                        <div className="w-px h-8 bg-brand-gold/20 hidden md:block"></div>
                                        <div className="flex flex-col items-center md:items-start">
                                            <span className="text-brand-dark font-serif font-bold text-2xl leading-none">{chef.rating}</span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Critical Acclaim</span>
                                        </div>
                                    </div>
                                    <div className="font-serif italic text-3xl text-brand-dark opacity-10 select-none tracking-widest uppercase">
                                        {chef.name.split(' ').pop()}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-12 tracking-tight">Curated Collections</h2>
                            <div className="space-y-16">
                                {chef.menus.map((menu) => (
                                    <MenuDisplay key={menu.id} menu={menu} onBook={onBookMenu} />
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-1" ref={availabilityRef}>
                        <div className="sticky top-32 space-y-10">
                            <BookingCalendar 
                                selectedDate={bookingDate}
                                onDateSelect={onSetBookingDate}
                                selectedTime={bookingTime}
                                onTimeSelect={onSetBookingTime}
                                bookedDates={bookedDates}
                            />
                            
                            {showMinSpendWarning && bookingDate && bookingTime && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-md animate-in fade-in duration-500">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm text-amber-800 font-medium">
                                                This chef has a minimum spend of <strong>£{minSpend}</strong>. Your current selection may not meet this.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-gold rounded-full blur-[80px] opacity-10 -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
                                <h4 className="text-2xl font-serif font-bold mb-5 relative z-10 text-brand-gold">Manifest the Evening</h4>
                                <p className="text-sm text-gray-400 mb-10 relative z-10 leading-relaxed italic">"Every culinary masterpiece begins with a conversation. Secure your date to begin the narrative."</p>
                                <button 
                                    onClick={scrollToAvailability}
                                    className="w-full bg-brand-gold text-brand-dark py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-xl shadow-brand-gold/20"
                                >
                                    Verify Availability
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {isPlayingTeaser && chef.teaserVideo && (
            <VideoPlayerOverlay src={chef.teaserVideo} onClose={() => setIsPlayingTeaser(false)} />
        )}
    </div>
  );
};

export default ChefProfile;
