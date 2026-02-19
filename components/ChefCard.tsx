
import React, { useState } from 'react';
import { Chef } from '../types';

interface ChefCardProps {
  chef?: Chef;
  onSelect?: (chef: Chef, bookNow?: boolean) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, chef: Chef) => void;
  isLoading?: boolean;
}

const ChefCard: React.FC<ChefCardProps> = ({ 
  chef, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite,
  isLoading = false 
}) => {
  if (isLoading || !chef) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full relative animate-pulse">
        <div className="relative h-64 w-full bg-gray-200">
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="h-6 w-20 bg-gray-300 rounded-lg"></div>
            <div className="h-6 w-16 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="absolute top-4 right-4 h-10 w-10 bg-gray-300 rounded-full"></div>
          <div className="absolute -bottom-10 left-6 z-20">
            <div className="relative">
              <div className="absolute -inset-1 bg-white rounded-2xl shadow-sm"></div>
              <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gray-300"></div>
            </div>
          </div>
        </div>
        <div className="pt-14 px-6 pb-6 flex flex-col flex-grow">
          <div className="flex flex-col mb-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-2"></div>
            <div className="flex items-center space-x-3 mt-2">
              <div className="h-6 w-12 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
            </div>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="border-t border-gray-100 my-4"></div>
          <div className="space-y-3 mt-auto">
            <div className="flex items-center">
              <div className="w-6 mr-3 h-4 bg-gray-200 rounded"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-6 mr-3 h-4 bg-gray-200 rounded"></div>
                <div className="flex flex-col space-y-1">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cardLabel = `View profile for Chef ${chef.name}. Rated ${chef.rating} stars. Price starting from £${chef.minPrice} per person.`;

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group flex flex-col h-full relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-dark/10 hover:border-brand-gold/20"
      onClick={() => onSelect?.(chef, false)}
    >
      <button
        type="button"
        className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer focus:opacity-100 focus:ring-2 focus:ring-brand-gold focus:ring-offset-2 rounded-2xl"
        onClick={() => onSelect?.(chef, false)}
        aria-label={cardLabel}
      />

      <div className="relative h-64 w-full bg-gray-100 pointer-events-none overflow-hidden">
        <img 
            src={chef.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"} 
            alt="" 
            aria-hidden="true"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" aria-hidden="true"></div>
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%] z-20" role="list" aria-label="Chef badges">
            {chef.badges && chef.badges.map((badge, idx) => (
                <span key={idx} role="listitem" className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-xl backdrop-blur-md border border-white/20 transition-transform duration-500 group-hover:translate-x-1
                    ${badge.toLowerCase().includes('luxury') ? 'bg-brand-dark text-brand-gold' : 'bg-white/90 text-gray-900'}`}>
                    {badge}
                </span>
            ))}
        </div>

        {onToggleFavorite && (
          <button 
            onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(e, chef);
            }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all focus:outline-none focus:bg-white/40 z-20 pointer-events-auto hover:scale-110 active:scale-90"
            aria-label={isFavorite ? `Remove Chef ${chef.name} from favorites` : `Add Chef ${chef.name} to favorites`}
            aria-pressed={isFavorite}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transition-all duration-300 ${isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'fill-transparent text-white'}`} 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        <div className="absolute -bottom-10 left-6 z-20" aria-hidden="true">
             <div className="relative group/avatar">
                <div className="absolute -inset-1 bg-white rounded-2xl shadow-xl transition-all duration-500 group-hover:bg-brand-gold"></div>
                <img 
                    src={chef.imageUrl}
                    alt={chef.name} 
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-2xl object-cover bg-gray-100 relative z-10 transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-lg z-20" title="LuxePlate Verified Chef">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
             </div>
        </div>
      </div>
      
      <div className="pt-14 px-6 pb-6 flex flex-col flex-grow pointer-events-none transition-colors duration-300">
        <div className="flex flex-col mb-4">
          <h3 className="text-2xl font-serif font-bold text-gray-900 leading-tight transition-colors duration-300 group-hover:text-brand-gold">{chef.name}</h3>
          <div 
            className="flex items-center text-gray-700 mt-2 space-x-3" 
            aria-label={`Rating: ${chef.rating} stars`}
            role="img"
          >
             <div className="flex items-center bg-orange-50 px-2 py-0.5 rounded-lg text-orange-700 shadow-sm border border-orange-100" aria-hidden="true">
                 <svg className="w-3.5 h-3.5 fill-current mr-1 text-orange-500" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                 <span className="font-bold text-xs">{chef.rating}</span>
             </div>
             <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest" aria-hidden="true">{chef.reviewsCount} Excellence Awards</span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
            {chef.tags && chef.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[10px] font-bold text-brand-dark/60 bg-brand-accent/30 px-2 py-0.5 rounded uppercase tracking-tighter">
                    {tag}
                </span>
            ))}
        </div>

        <div className="space-y-4 mt-auto">
            <div className="border-t border-gray-100 my-4 transition-all duration-500 group-hover:border-brand-gold/10" aria-hidden="true"></div>
            <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                 <div className="w-6 flex justify-center mr-3 text-brand-gold" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 </div>
                {chef.location}
            </div>

             <div className="flex items-center text-sm text-gray-900 font-bold">
                 <div className="w-6 flex justify-center mr-3 text-brand-gold" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-1">Starting from</span>
                    <span className="text-xl">£{chef.minPrice}<span className="text-xs font-normal text-gray-400 ml-1">/pp</span></span>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 relative z-20 pointer-events-auto">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect?.(chef, true);
                    }}
                    className="w-full bg-brand-dark text-brand-gold py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-black hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group/btn relative overflow-hidden ring-1 ring-brand-gold/20"
                >
                    <span className="relative z-10">Book Experience</span>
                    <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChefCard;
