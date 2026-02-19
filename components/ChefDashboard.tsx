
import React, { useState, useEffect, useRef } from 'react';
import { Chef, Booking } from '../types';
import { db } from '../services/databaseService';
import ChefMenuManager from './ChefMenuManager';
import { generateHighQualityImage } from '../services/geminiService';

interface ChefDashboardProps {
  chef: Chef;
  onUpdateChef: (chef: Chef) => void;
  onExit: () => void;
  onGenerateTeaser?: () => void;
}

const ChefDashboard: React.FC<ChefDashboardProps> = ({ chef, onUpdateChef, onExit, onGenerateTeaser }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MENUS' | 'BOOKINGS' | 'PROFILE'>('OVERVIEW');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBookings(db.getBookingsByChefId(chef.id));
  }, [chef.id]);

  const handleUpdateBookingStatus = async (booking: Booking, status: 'CONFIRMED' | 'COMPLETED') => {
      const updated = { ...booking, status };
      await db.updateBooking(updated);
      setBookings(bookings.map(b => b.id === booking.id ? updated : b));
  };

  const persistChefData = (updatedChef: Chef) => {
    onUpdateChef(updatedChef);
    db.saveChef(updatedChef); // Direct database commit
  };

  const handleManualImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          persistChefData({ ...chef, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateChefImage = async () => {
    setIsGeneratingImg(true);
    try {
        const aiImg = await generateHighQualityImage(
          `Professional high-end headshot of Chef ${chef.name} in a Michelin kitchen setting, cinematic lighting, 8k resolution.`,
          { aspectRatio: "1:1", imageSize: "1K" }
        );
        persistChefData({ ...chef, imageUrl: aiImg });
    } catch (err) {
        alert("Visual synthesis failed.");
    } finally {
        setIsGeneratingImg(false);
    }
  };

  const OverviewTab = () => (
      <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Balance</h3>
                  <div className="text-3xl font-serif font-bold text-gray-900">£{(bookings.filter(b => b.status === 'CONFIRMED').reduce((s,b) => s + b.totalPrice, 0) * 0.85).toFixed(2)}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">Payable in current cycle</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Inquiries</h3>
                  <div className="text-3xl font-serif font-bold text-gray-900">{bookings.filter(b => b.status === 'PENDING').length}</div>
                  <div className="text-xs text-amber-600 font-medium mt-1">Requires focus</div>
              </div>
          </div>
          <div className="bg-brand-dark rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold rounded-full blur-[100px] opacity-10 -mr-32 -mt-32"></div>
             <div className="relative z-10">
                 <h3 className="text-3xl font-serif font-bold mb-3">Bonjour, Chef {chef.name.split(' ')[0]}</h3>
                 <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">Your culinary portfolio is currently synchronized with our luxury marketplace protocols.</p>
                 <div className="flex gap-4">
                  <button onClick={() => setActiveTab('MENUS')} className="bg-brand-gold text-brand-dark px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white transition-all">Orchestrate Menus</button>
                  <button onClick={() => setActiveTab('PROFILE')} className="bg-white/5 border border-white/10 text-white px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Identity Settings</button>
                 </div>
             </div>
          </div>
      </div>
  );

  const ProfileTab = () => (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-12 animate-in fade-in duration-500 max-w-2xl">
          <h3 className="font-serif font-bold text-2xl text-gray-900 mb-10">Chef Identity Protocol</h3>
          <div className="space-y-10">
              <div className="flex gap-10 items-center">
                  <div className="relative group flex-shrink-0">
                      <div className="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative bg-gray-100">
                          <img src={chef.imageUrl} className="w-full h-full object-cover" alt="Profile" />
                          {isGeneratingImg && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div></div>}
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          <button onClick={handleGenerateChefImage} disabled={isGeneratingImg} className="p-3 bg-brand-dark text-brand-gold rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.531 1.593a2 2 0 00-1.96-1.414l-2.387.477a2 2 0 00-1.022.547l-1.428 1.428a2 2 0 00-.547 1.022l-.477 2.387a2 2 0 001.414 1.96l1.593.531a2 2 0 011.369 1.898V21M13 11a3 3 0 11-6 0 3 3 0 016 0zM17 5h.01M21 9h.01"></path></svg></button>
                          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl shadow-xl hover:scale-105 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg></button>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleManualImageUpload} />
                  </div>
                  <div>
                      <p className="font-bold text-gray-900 mb-2">Bespoke Portraiture</p>
                      <p className="text-xs text-gray-500 leading-relaxed">AI Synthesis or manual upload. Large portraits are persistently archived to your verified dossier.</p>
                  </div>
              </div>
              <div className="space-y-6 pt-10 border-t border-gray-50">
                  <input value={chef.name} onChange={e => persistChefData({...chef, name: e.target.value})} className="w-full border-b border-gray-100 p-4 font-bold text-gray-900 focus:border-brand-gold outline-none text-2xl" placeholder="Full Name" />
                  <textarea value={chef.bio} onChange={e => persistChefData({...chef, bio: e.target.value})} className="w-full border border-gray-100 rounded-2xl p-6 h-40 resize-none focus:border-brand-gold outline-none text-sm text-gray-600 leading-relaxed" placeholder="Culinary Philosophy..." />
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest pt-4">
                      <span>Sync State: Persistent</span>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <div className="w-72 bg-brand-dark text-white flex-shrink-0 flex flex-col fixed h-full z-20">
        <div className="p-8 border-b border-white/10 flex items-center space-x-4">
             <img src={chef.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-white/20 shadow-xl" alt="Chef" />
             <div className="min-w-0">
                 <div className="font-serif font-bold text-lg text-brand-gold truncate">{chef.name}</div>
                 <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Verified Partner</div>
             </div>
        </div>
        <nav className="flex-grow p-6 space-y-2">
           {['OVERVIEW', 'MENUS', 'BOOKINGS', 'PROFILE'].map((tab) => (
               <button key={tab} onClick={() => setActiveTab(tab as any)} className={`w-full flex items-center px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white/10 text-brand-gold shadow-inner border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                    {tab}
               </button>
           ))}
        </nav>
        <div className="p-6 border-t border-white/10">
           <button onClick={onExit} className="w-full flex items-center px-6 py-4 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors uppercase tracking-widest">Exit Portal</button>
        </div>
      </div>
      <main className="flex-grow ml-72 p-12 overflow-y-auto">
        {activeTab === 'OVERVIEW' && <OverviewTab />}
        {activeTab === 'MENUS' && <ChefMenuManager chef={chef} onUpdate={persistChefData} onGenerateTeaser={onGenerateTeaser} />}
        {activeTab === 'PROFILE' && <ProfileTab />}
        {activeTab === 'BOOKINGS' && <div className="bg-white p-20 rounded-[3rem] text-center border border-gray-100 shadow-sm"><h3 className="text-3xl font-serif font-bold text-brand-dark">Reservation Ledger</h3></div>}
      </main>
    </div>
  );
};

export default ChefDashboard;
