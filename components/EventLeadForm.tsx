
import React, { useState } from 'react';
import { db } from '../services/databaseService';
import { EventLead } from '../types';

const EventLeadForm: React.FC<{ onComplete: () => void; onCancel: () => void }> = ({ onComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    location: '',
    date: '',
    guests: 6,
    budget: 1000,
    cuisinePreference: 'Any',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newLead: EventLead = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: 'NEW',
      suggestedChefIds: [],
      createdAt: new Date().toISOString()
    };
    await new Promise(r => setTimeout(r, 1200));
    db.saveEventLead(newLead);
    db.addSystemLog(`Inbound Event Lead created by ${formData.clientName}`);
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl border border-brand-gold/10 p-12 md:p-16">
        <div className="text-center mb-12">
            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] mb-4 block">Concierge Assistance</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark tracking-tighter">Manifest Your Event</h2>
            <p className="text-gray-500 mt-4 italic">"Our curatorial AI will match your vision with the world's most elite chefs."</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                    <input required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm focus:border-brand-gold outline-none font-medium" placeholder="Full Identity" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm focus:border-brand-gold outline-none font-medium" placeholder="you@prestige.com" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Venue Territory</label>
                    <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm focus:border-brand-gold outline-none font-medium" placeholder="City or Postcode" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Desired Timeline</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm focus:border-brand-gold outline-none font-medium" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Guest Tally</label>
                    <input type="number" value={formData.guests} onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm focus:border-brand-gold outline-none font-medium" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Indicative Budget (£)</label>
                    <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm focus:border-brand-gold outline-none font-medium" />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Narrative & Specifics</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-sm focus:border-brand-gold outline-none font-medium h-32 resize-none italic" placeholder="Tell us about the occasion..." />
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-brand-dark text-brand-gold py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3">
                    {loading ? <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : 'Submit Inquiry'}
                </button>
                <button type="button" onClick={onCancel} className="md:w-32 bg-gray-100 text-gray-500 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-gray-200 transition-all">Cancel</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EventLeadForm;
