
import React, { useState, useEffect } from 'react';
import { Chef, Menu, SearchParams, ViewState, CuisineType, User, Booking, MenuRecommendation } from './types';
import { searchChefs, generateBookingConfirmation } from './services/geminiService';
import { authService } from './services/authService';
import { db } from './services/databaseService';
import { sendConfirmationEmail } from './services/emailService';

import ChefCard from './components/ChefCard';
import AuthModal from './components/AuthModal';
import ChefDashboard from './components/ChefDashboard';
import ChefProfile from './components/ChefProfile';
import LoadingScreen from './components/LoadingScreen';
import ChefSebastianLive from './components/ChefSebastianLive';
import AppIntro from './components/AppIntro';
import VeoVideoGenerator from './components/VeoVideoGenerator';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import PaymentGateway from './components/PaymentGateway';
import EventLeadForm from './components/EventLeadForm';

// NEW: Celebrity Endorsement Data
const endorsements = [
  {
    name: 'Giles Coren',
    title: 'The Times Restaurant Critic',
    quote: "LuxePlate isn't just a service; it's a paradigm shift in haute cuisine. The future of fine dining is not in a restaurant, but in your dining room.",
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Amelia Windsor',
    title: 'Fashion Icon & Philanthropist',
    quote: "For intimate gatherings, the sheer elegance and bespoke nature of a LuxePlate chef is unparalleled. It’s my secret to flawless hosting.",
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Lord Harrington',
    title: 'Tech Entrepreneur & Investor',
    quote: "The seamless integration of world-class culinary talent with sophisticated technology is what sets LuxePlate apart. It's a five-star experience from booking to the final bite.",
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  }
];

// NEW: Celebrity Endorsement Card Component
const CelebrityEndorsementCard: React.FC<{ endorsement: typeof endorsements[0] }> = ({ endorsement }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-brand-dark/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl -mr-24 -mt-24"></div>
      <div className="relative z-10">
        <svg className="w-12 h-12 text-brand-gold/20 mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 14.896 15.877 12.157 18.5 10.5V10.5C18.887 10.258 19.354 10.125 19.846 10.125C21.036 10.125 22 11.089 22 12.279V12.279C22 12.716 21.868 13.14 21.621 13.497L19.857 16.052C19.464 16.627 19.25 17.305 19.25 18V21H14.017ZM4.017 21L4.017 18C4.017 14.896 5.877 12.157 8.5 10.5V10.5C8.887 10.258 9.354 10.125 9.846 10.125C11.036 10.125 12 11.089 12 12.279V12.279C12 12.716 11.868 13.14 11.621 13.497L9.857 16.052C9.464 16.627 9.25 17.305 9.25 18V21H4.017Z" /></svg>
        <p className="font-serif italic text-xl text-brand-dark leading-relaxed mb-8">"{endorsement.quote}"</p>
        <div className="flex items-center gap-5 pt-8 border-t border-gray-100">
          <img src={endorsement.image} alt={endorsement.name} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-xl" />
          <div>
            <h4 className="font-serif font-bold text-lg text-brand-dark">{endorsement.name}</h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{endorsement.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLiveConciergeOpen, setIsLiveConciergeOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState<ViewState>('HOME'); 
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({ location: 'London', date: '', guests: 6, cuisine: '' });
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [autoScrollToBooking, setAutoScrollToBooking] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
        if (user.role === 'ADMIN') setView('ADMIN');
    }
    loadInitialChefs();
  }, []);

  const loadInitialChefs = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000)); 
      const cached = db.getCachedChefs();
      if (cached.length > 0) {
          setChefs(cached);
          setLoading(false);
          searchChefs(searchParams.location, 'Any').then(results => {
              db.cacheChefs(results);
              setChefs(results);
          });
      } else {
          const results = await searchChefs(searchParams.location, 'Any');
          db.cacheChefs(results);
          setChefs(results);
          setLoading(false);
      }
  }

  const handleSelectChef = (chef: Chef, bookNow?: boolean) => {
    setSelectedChef(chef);
    setAutoScrollToBooking(!!bookNow);
    setView('CHEF_PROFILE');
    window.scrollTo(0,0);
  };

  const handleUpdateChefGeneric = (updatedChef: Chef) => {
      db.saveChef(updatedChef);
      if (selectedChef?.id === updatedChef.id) setSelectedChef(updatedChef);
      setChefs(prev => prev.map(c => c.id === updatedChef.id ? updatedChef : c));
  };

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      if (user.role === 'CHEF') {
          const existing = db.getCachedChefs().find(c => c.name === user.name);
          if (existing) {
              setSelectedChef(existing);
              setView('CHEF_DASHBOARD');
          } else {
              const newChef: Chef = {
                  id: user.id, name: user.name, location: 'Global', bio: 'Welcome to LuxePlate.', rating: 5.0, reviewsCount: 0, cuisines: ['European'], imageUrl: user.avatar || '', minPrice: 50, minSpend: 300, menus: [], yearsExperience: 0, eventsCount: 0, badges: ['New Talent'], tags: []
              };
              db.saveChef(newChef);
              setSelectedChef(newChef);
              setView('CHEF_DASHBOARD');
          }
      } else if (user.role === 'ADMIN') {
        setView('ADMIN');
      }
  };

  const handlePaymentSuccess = async () => {
      if (!currentUser || !selectedChef || !selectedMenu || !bookingDate || !bookingTime) return;
      const totalPrice = selectedMenu.pricePerHead * searchParams.guests;
      const newBooking: Booking = {
          id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, chefId: selectedChef.id, chefName: selectedChef.name, chefImage: selectedChef.imageUrl, menuName: selectedMenu.name, date: bookingDate.toLocaleDateString(), time: bookingTime, guests: searchParams.guests, totalPrice: totalPrice, status: 'CONFIRMED', createdAt: new Date().toISOString()
      };
      await db.createBooking(newBooking);
      try {
        const confirmationMsg = await generateBookingConfirmation(selectedChef.name, selectedMenu.name, searchParams.guests, bookingDate.toLocaleDateString(), bookingTime);
        sendConfirmationEmail(currentUser, newBooking, confirmationMsg);
      } catch (e) { console.error("AI confirmation generation failed", e); }
      setView('BOOKING_SUCCESS');
  };

  if (showIntro) return <AppIntro onComplete={() => setShowIntro(false)} />;

  return (
    <div className="min-h-screen font-sans text-brand-dark bg-white">
      {(view === 'HOME' || view === 'CHEF_PROFILE') && (
          <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl shadow-sm px-6 py-5 border-b border-gray-100 transition-all duration-500">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div onClick={() => setView('HOME')} className="flex items-center space-x-2 cursor-pointer group">
                  <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-brand-gold font-serif font-bold text-2xl group-hover:scale-110 transition-transform">L</div>
                  <h1 className="text-2xl font-serif font-bold tracking-tighter">Luxe<span className="text-brand-gold">Plate</span></h1>
                </div>
                
                <div className="hidden lg:flex items-center gap-10">
                    <button onClick={() => setView('REQUEST_CHEF_FORM')} className="text-[10px] font-bold text-gray-400 hover:text-brand-gold uppercase tracking-[0.3em] transition-colors">Request a Chef</button>
                    <div onClick={() => setIsSearchExpanded(!isSearchExpanded)} className="hidden md:flex items-center space-x-8 bg-gray-50 border border-gray-100 rounded-2xl px-8 py-3 cursor-pointer hover:bg-white hover:shadow-xl transition-all group">
                        <div className="flex flex-col"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Location</span><span className="text-xs font-bold text-brand-dark">{searchParams.location}</span></div>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <div className="flex flex-col"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Guests</span><span className="text-xs font-bold text-brand-dark">{searchParams.guests} Persons</span></div>
                        <div className="bg-brand-dark p-2 rounded-xl text-brand-gold transition-colors group-hover:bg-brand-gold group-hover:text-brand-dark"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    {currentUser ? (
                        <button onClick={() => { if (currentUser.role === 'CHEF') setView('CHEF_DASHBOARD'); else if (currentUser.role === 'ADMIN') setView('ADMIN'); }} className="flex items-center space-x-3 bg-gray-50 p-1.5 pr-5 rounded-2xl border border-gray-100 cursor-pointer group hover:bg-white hover:shadow-lg transition-all">
                            <img src={currentUser.avatar} className="w-9 h-9 rounded-xl shadow-md border border-white" alt="Profile" />
                            <div className="flex flex-col items-start"><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Portal</span><span className="text-xs font-bold text-brand-dark">{currentUser.name.split(' ')[0]}</span></div>
                        </button>
                    ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="bg-brand-dark text-white px-10 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-brand-dark/20 hover:bg-black hover:-translate-y-0.5 transition-all">Join The Circle</button>
                    )}
                </div>
              </div>
          </div>
      )}

      {view === 'HOME' && (
          <div className="pt-40 pb-32 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h2 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark tracking-tighter mb-6">Experience Culinary <span className="text-brand-gold">Excellence.</span></h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto italic">"World-class private chefs, tailored menus, and unforgettable moments delivered to your home."</p>
                    <div className="mt-12 flex items-center justify-center gap-6">
                        <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="bg-brand-gold text-brand-dark px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl hover:bg-white transition-all">Explore Talents</button>
                        <button onClick={() => setView('REQUEST_CHEF_FORM')} className="bg-brand-dark text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl hover:bg-black transition-all">Bespoke Inquiry</button>
                    </div>
                </div>
                
                <div className="mb-32 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] mb-4 block">As Endorsed By</span>
                        <h3 className="text-4xl font-serif font-bold text-brand-dark tracking-tighter">The Voices of Prestige</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {endorsements.map((endorsement, i) => (
                            <CelebrityEndorsementCard key={i} endorsement={endorsement} />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {loading ? Array.from({ length: 6 }).map((_, i) => <ChefCard key={`skeleton-${i}`} isLoading={true} />) : chefs.map(chef => <ChefCard key={chef.id} chef={chef} onSelect={handleSelectChef} />)}
                </div>
              </div>
          </div>
      )}

      {view === 'REQUEST_CHEF_FORM' && (
          <EventLeadForm 
            onComplete={() => { alert("Thank you. Our concierges will reach out with curated options shortly."); setView('HOME'); }}
            onCancel={() => setView('HOME')}
          />
      )}

      {view === 'ADMIN_LOGIN' && <AdminLogin onLoginSuccess={handleLoginSuccess} onCancel={() => setView('HOME')} />}
      {view === 'CHEF_PROFILE' && selectedChef && <ChefProfile chef={selectedChef} currentUser={currentUser} guestCount={searchParams.guests} isFavorite={false} bookedDates={[]} bookingDate={bookingDate} bookingTime={bookingTime} onSetBookingDate={setBookingDate} onSetBookingTime={setBookingTime} onBack={() => setView('HOME')} onToggleFavorite={() => {}} onBookMenu={(m) => { setSelectedMenu(m); setView('BOOKING_DETAILS'); }} similarMenus={[]} loadingSimilar={false} onSelectSimilar={() => {}} onUpdateChef={handleUpdateChefGeneric} autoScroll={autoScrollToBooking} />}
      {view === 'CHEF_DASHBOARD' && selectedChef && <ChefDashboard chef={selectedChef} onUpdateChef={handleUpdateChefGeneric} onExit={() => setView('HOME')} onGenerateTeaser={() => setView('VIDEO_GENERATION')} />}
      {view === 'VIDEO_GENERATION' && selectedChef && <VeoVideoGenerator chefName={selectedChef.name} onComplete={(url) => { handleUpdateChefGeneric({ ...selectedChef, teaserVideo: url }); setView('CHEF_DASHBOARD'); }} onCancel={() => setView('CHEF_DASHBOARD')} />}
      {view === 'BOOKING_DETAILS' && (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-brand-light animate-in fade-in duration-700">
              <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-brand-gold/10">
                  <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold mx-auto mb-8 border border-brand-gold/20 shadow-inner"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                  <h2 className="text-4xl font-serif font-bold mb-4 tracking-tighter">The Experience Begins...</h2>
                  <p className="text-gray-500 mb-12 leading-relaxed italic">"Chef {selectedChef?.name} is reviewing your vision for an extraordinary evening."</p>
                  <button onClick={() => setView('PAYMENT')} className="w-full bg-brand-dark text-white py-5 rounded-2xl font-bold shadow-2xl hover:bg-black transition-all transform hover:-translate-y-1">Proceed to Payment</button>
                  <button onClick={() => setView('CHEF_PROFILE')} className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] hover:text-brand-dark transition-colors">Back to Portfolio</button>
              </div>
          </div>
      )}
      {view === 'PAYMENT' && selectedChef && selectedMenu && <PaymentGateway amount={selectedMenu.pricePerHead * searchParams.guests} chefName={selectedChef.name} menuName={selectedMenu.name} onSuccess={handlePaymentSuccess} onCancel={() => setView('BOOKING_DETAILS')} />}
      {view === 'BOOKING_SUCCESS' && (
          <div className="h-screen flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500 bg-brand-dark text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent"></div>
              <div className="relative z-10">
                  <div className="w-24 h-24 bg-brand-gold rounded-full flex items-center justify-center text-brand-dark mb-10 border-4 border-white/20 shadow-2xl mx-auto"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
                  <h2 className="text-6xl md:text-8xl font-serif font-bold mb-6 tracking-tighter">A Taste of <span className="text-brand-gold">Prestige.</span></h2>
                  <p className="text-gray-400 mb-16 max-w-sm mx-auto text-xl italic font-medium">Chef {selectedChef?.name} is honored to curate this narrative for you.</p>
                  <button onClick={() => setView('HOME')} className="bg-brand-gold text-brand-dark px-20 py-6 rounded-[2rem] font-bold shadow-2xl hover:bg-white transition-all transform hover:-translate-y-1 uppercase tracking-[0.2em] text-xs">Return To Collections</button>
              </div>
          </div>
      )}
      {view === 'ADMIN' && <AdminDashboard onExit={() => setView('HOME')} />}
      {(view !== 'ADMIN' && view !== 'ADMIN_LOGIN' && view !== 'CHEF_DASHBOARD' && view !== 'VIDEO_GENERATION' && view !== 'BOOKING_SUCCESS' && view !== 'PAYMENT' && view !== 'REQUEST_CHEF_FORM' && !showIntro) && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-brand-dark/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex items-center p-2.5 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[95%] max-w-sm transition-transform duration-500 hover:scale-105">
              <button onClick={() => setView('HOME')} className={`flex-1 flex flex-col items-center py-4 rounded-2xl transition-all ${view === 'HOME' ? 'bg-white/10 text-brand-gold shadow-inner' : 'text-gray-500 hover:text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg><span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-2">Collections</span></button>
              <button onClick={() => setIsLiveConciergeOpen(true)} className="flex-1 flex flex-col items-center bg-brand-gold text-brand-dark p-4 rounded-[2rem] shadow-2xl transform active:scale-95 transition-all mx-1.5 group"><div className="relative"><div className="absolute -inset-2 bg-brand-dark/20 rounded-full animate-ping group-hover:bg-white/50"></div><svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg></div><span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-2">Sebastian</span></button>
              <button onClick={() => { if (currentUser?.role === 'CHEF') { const existing = db.getCachedChefs().find(c => c.name === currentUser.name); if (existing) { setSelectedChef(existing); setView('CHEF_DASHBOARD'); } } else if (currentUser?.role === 'ADMIN') { setView('ADMIN'); } else { setIsAuthModalOpen(true); } }} className={`flex-1 flex flex-col items-center py-4 rounded-2xl transition-all ${view === 'ADMIN' || view === 'CHEF_DASHBOARD' ? 'bg-white/10 text-brand-gold shadow-inner' : 'text-gray-500 hover:text-white'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><span className="text-[9px] font-bold uppercase tracking-[0.2em] mt-2">{currentUser?.role === 'CHEF' ? 'Portal' : 'Account'}</span></button>
          </div>
      )}
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} onAdminAccess={() => { setIsAuthModalOpen(false); setView('ADMIN_LOGIN'); }} />}
      {isLiveConciergeOpen && <ChefSebastianLive onClose={() => setIsLiveConciergeOpen(false)} currentUser={currentUser} />}
    </div>
  );
};

export default App;
