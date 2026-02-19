
import React, { useState, useEffect, useMemo } from 'react';
import { db, RecruitmentLead } from '../services/databaseService';
import { User, Booking, Chef, AdminTab, Promotion, GiftCard, ChefRequest, EventLead, SocialPost } from '../types';
import { authService } from '../services/authService';
import { 
    generateGrowthForecast, 
    generateSocialCampaign, 
    generateTrafficInsights,
    generateMarketDiscovery,
    generateBudgetStrategy,
    generateCommTemplate,
    generateMarketingStrategy,
    vetChefApplication,
    generatePrintAssets,
    generateTalentOutreach,
    optimizeHashtags,
    handleAIServiceError
} from '../services/geminiService';
import ChefSebastianLive from './ChefSebastianLive';

// --- Internal Reusable UI Components ---

const AdminStat: React.FC<{ label: string; value: string; trend?: string; color?: 'gold' | 'emerald' | 'rose' }> = ({ label, value, trend, color = 'gold' }) => {
  const colorMap = {
    gold: 'bg-brand-gold/5 text-brand-gold',
    emerald: 'bg-emerald-500/5 text-emerald-500',
    rose: 'bg-rose-500/5 text-rose-500'
  };
  
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 ${colorMap[color].split(' ')[0]} rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 relative z-10">{label}</p>
      <div className="flex items-baseline gap-3 relative z-10">
        <h4 className="text-4xl font-serif font-bold text-brand-dark tracking-tighter">{value}</h4>
        {trend && <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>}
      </div>
    </div>
  );
};

const DataTable = <T extends Record<string, any>>({ 
  data, 
  columns, 
  title, 
  idField = 'id',
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
  actionButton,
  onRowClick
}: { 
  data: T[], 
  columns: { key: keyof T, label: string, render?: (val: any, item: T) => React.ReactNode }[],
  title: string,
  idField?: keyof T,
  selectable?: boolean,
  selectedIds?: string[],
  onSelectionChange?: (ids: string[]) => void,
  bulkActions?: React.ReactNode,
  actionButton?: React.ReactNode,
  onRowClick?: (item: T) => void
}) => {
  const [search, setSearch] = useState('');
  
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const toggleAll = () => {
    if (selectedIds.length > 0) onSelectionChange?.([]);
    else onSelectionChange?.(filteredData.map(item => String(item[idField])));
  };

  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) onSelectionChange?.(selectedIds.filter(sid => sid !== id));
    else onSelectionChange?.([...selectedIds, id]);
  };

  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-8 md:p-12 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-white sticky top-0 z-20">
        <div>
          <h3 className="text-3xl font-serif font-bold text-brand-dark">{title}</h3>
          <p className="text-gray-400 text-sm mt-1 font-medium">{filteredData.length} entities active</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
             <input 
                type="text" 
                placeholder="Search Database..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-2xl py-3 px-10 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-brand-gold w-full md:w-64"
             />
             <svg className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          {actionButton}
        </div>
      </div>
      
      {selectable && selectedIds.length > 0 && (
          <div className="px-10 py-5 bg-brand-dark text-white flex items-center justify-between animate-in slide-in-from-top-4 sticky top-[104px] z-20">
              <div className="flex items-center gap-4">
                  <span className="bg-brand-gold text-brand-dark h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold">{selectedIds.length}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Active Selection</span>
              </div>
              <div className="flex gap-4">
                {bulkActions}
                <button onClick={() => onSelectionChange?.([])} className="text-[9px] font-bold text-gray-400 hover:text-white uppercase tracking-widest">Terminate</button>
              </div>
          </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-50">
            <tr>
              {selectable && <th className="px-8 py-6 w-10"><input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredData.length} onChange={toggleAll} className="rounded border-gray-300 text-brand-gold" /></th>}
              {columns.map(col => <th key={String(col.key)} className="px-10 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{col.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredData.length === 0 ? (
                <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="px-10 py-32 text-center text-gray-300 italic font-serif text-2xl">Empty state</td></tr>
            ) : filteredData.map((item, idx) => {
                const id = String(item[idField]);
                const isSelected = selectedIds.includes(id);
                return (
                    <tr 
                      key={idx} 
                      onClick={() => onRowClick?.(item)}
                      className={`hover:bg-brand-light/50 transition-all ${isSelected ? 'bg-brand-gold/5' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                        {selectable && <td className="px-8 py-8" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={isSelected} onChange={() => toggleRow(id)} className="rounded border-gray-300 text-brand-gold" /></td>}
                        {columns.map(col => (
                            <td key={String(col.key)} className="px-10 py-8 text-sm font-medium text-gray-700">
                                {col.render ? col.render(item[col.key], item) : item[col.key]}
                            </td>
                        ))}
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SocialCampaignModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCampaignGenerated: (post: Partial<SocialPost>) => void;
  chefs: Chef[];
  eventLeads: EventLead[];
}> = ({ isOpen, onClose, onCampaignGenerated, chefs, eventLeads }) => {
    const [theme, setTheme] = useState('');
    const [targetType, setTargetType] = useState<'PLATFORM' | 'CHEF' | 'EVENT'>('PLATFORM');
    const [targetId, setTargetId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [optimizingHashtags, setOptimizingHashtags] = useState(false);
    const [error, setError] = useState('');
    const [generatedPost, setGeneratedPost] = useState<Partial<SocialPost> | null>(null);
    const [previewTab, setPreviewTab] = useState<'INSTAGRAM' | 'FACEBOOK' | 'X_TWITTER'>('INSTAGRAM');

    if (!isOpen) return null;

    const getTargetName = () => {
        if (targetType === 'PLATFORM') return 'LuxePlate Official';
        if (targetType === 'CHEF') return chefs.find(c => c.id === targetId)?.name || 'Chef Partner';
        if (targetType === 'EVENT') return eventLeads.find(e => e.id === targetId)?.clientName || 'Gala Event';
        return '';
    };

    const handleGenerate = async () => {
        if (!theme) {
            setError('Strategic theme required.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const targetName = getTargetName();
            const campaignData = await generateSocialCampaign(theme, `${targetType}: ${targetName}`);
            
            const newPost: Partial<SocialPost> = {
                targetType,
                targetId: targetType !== 'PLATFORM' ? targetId : undefined,
                targetName,
                platforms: ['INSTAGRAM', 'FACEBOOK', 'X_TWITTER'],
                content: campaignData.content,
                hashtags: campaignData.hashtags,
                visualPrompt: campaignData.visualPrompt,
                status: 'SCHEDULED',
            };
            setGeneratedPost(newPost);
        } catch (e: any) {
            setError(handleAIServiceError(e));
        } finally {
            setLoading(false);
        }
    };

    const handleOptimizeHashtags = async () => {
        if (!generatedPost?.content?.instagram) return;
        setOptimizingHashtags(true);
        try {
            const newHashtags = await optimizeHashtags(generatedPost.content.instagram, "UK/EU Luxury Dining");
            setGeneratedPost(prev => ({ ...prev, hashtags: newHashtags }));
        } catch (e) {
            alert("Hashtag lab failed to synthesize trends.");
        } finally {
            setOptimizingHashtags(false);
        }
    };

    const handleFinalize = () => {
        if (generatedPost) {
            onCampaignGenerated(generatedPost);
            onClose();
            setGeneratedPost(null);
            setTheme('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-brand-dark/95 backdrop-blur-3xl" onClick={onClose}></div>
            <div className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-white/10">
                <div className="flex-grow flex flex-col lg:flex-row h-full">
                    {/* Left: Configuration Panel */}
                    <div className="lg:w-[350px] p-10 border-r border-gray-100 flex flex-col justify-between bg-gray-50/50 h-full overflow-y-auto no-scrollbar">
                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center text-brand-gold font-serif font-bold text-xl">S</div>
                                <h3 className="text-2xl font-serif font-bold text-brand-dark tracking-tighter">Social Lab</h3>
                            </div>
                            
                            <div className="space-y-10">
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] block mb-4">Strategic Objective</label>
                                    <textarea 
                                        value={theme} 
                                        onChange={e => setTheme(e.target.value)} 
                                        className="w-full p-6 bg-white border border-gray-100 rounded-[2rem] text-sm focus:border-brand-gold outline-none h-40 resize-none shadow-inner italic leading-relaxed"
                                        placeholder="Promote Chef Marco's new 'Venetian Gold' menu for Autumn bookings..."
                                    />
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] block mb-4">Node Target</label>
                                        <select value={targetType} onChange={e => { setTargetType(e.target.value as any); setTargetId(''); }} className="w-full p-4 border border-gray-100 rounded-2xl bg-white text-xs font-bold focus:border-brand-gold outline-none shadow-sm">
                                            <option value="PLATFORM">LuxePlate General</option>
                                            <option value="CHEF">Chef Partner</option>
                                            <option value="EVENT">Live Event Lead</option>
                                        </select>
                                    </div>
                                    {targetType !== 'PLATFORM' && (
                                        <div className="animate-in slide-in-from-top-2">
                                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.4em] block mb-4">Identify Entity</label>
                                            <select value={targetId} onChange={e => setTargetId(e.target.value)} className="w-full p-4 border border-gray-100 rounded-2xl bg-white text-xs font-bold focus:border-brand-gold outline-none shadow-sm">
                                                <option value="">Select Node...</option>
                                                {targetType === 'CHEF' && chefs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                {targetType === 'EVENT' && eventLeads.map(e => <option key={e.id} value={e.id}>{e.clientName}'s Gala</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-10">
                             <button onClick={handleGenerate} disabled={loading || !theme} className="w-full bg-brand-dark text-brand-gold py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4">
                                {loading ? <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : 'Initiate Synthesis'}
                             </button>
                        </div>
                    </div>

                    {/* Right: Preview & Live Sandbox */}
                    <div className="flex-grow p-10 lg:p-16 overflow-y-auto no-scrollbar relative bg-white flex flex-col">
                        {generatedPost ? (
                            <div className="h-full flex flex-col space-y-12 animate-in slide-in-from-right duration-700">
                                <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-gray-50 pb-10">
                                    <div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.4em]">Ready for Optimization</span>
                                        </div>
                                        <h4 className="text-5xl font-serif font-bold text-brand-dark tracking-tighter">Campaign Matrix</h4>
                                    </div>
                                    <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
                                        {(['INSTAGRAM', 'FACEBOOK', 'X_TWITTER'] as const).map(tab => (
                                            <button key={tab} onClick={() => setPreviewTab(tab)} className={`px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${previewTab === tab ? 'bg-brand-dark text-brand-gold shadow-xl' : 'text-gray-400 hover:text-brand-dark'}`}>
                                                {tab.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-grow grid grid-cols-1 xl:grid-cols-5 gap-12">
                                    {/* Virtual Phone Mockup */}
                                    <div className="xl:col-span-2 flex justify-center">
                                        <div className="w-[300px] h-[600px] bg-brand-dark rounded-[3rem] border-[8px] border-gray-900 shadow-2xl relative overflow-hidden flex flex-col group/phone hover:scale-[1.02] transition-transform duration-700">
                                            <div className="h-6 w-32 bg-gray-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-20"></div>
                                            <div className="flex-grow bg-white flex flex-col">
                                                <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-serif font-bold text-sm">L</div>
                                                    <span className="text-[10px] font-bold text-brand-dark">luxeplate_official</span>
                                                </div>
                                                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden group">
                                                    <div className="text-center p-8">
                                                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mb-4">Neural Visual Layer</p>
                                                        <p className="text-[10px] text-gray-400 italic leading-relaxed">"{generatedPost.visualPrompt}"</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="flex gap-4"><div className="w-4 h-4 rounded-full bg-gray-100"></div><div className="w-4 h-4 rounded-full bg-gray-100"></div><div className="w-4 h-4 rounded-full bg-gray-100"></div></div>
                                                    <div className="h-32 overflow-y-auto no-scrollbar">
                                                        <p className="text-[11px] text-brand-dark leading-relaxed">
                                                            <span className="font-bold mr-2">luxeplate_official</span>
                                                            {previewTab === 'INSTAGRAM' ? generatedPost.content?.instagram : previewTab === 'FACEBOOK' ? generatedPost.content?.facebook : generatedPost.content?.x_twitter}
                                                        </p>
                                                        <p className="text-[10px] text-blue-600 mt-2 font-medium leading-relaxed">{generatedPost.hashtags}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Optimization Controls */}
                                    <div className="xl:col-span-3 space-y-10">
                                        <div className="bg-brand-light p-10 rounded-[3rem] border border-brand-gold/10 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em]">Content Payload</span>
                                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{previewTab} Optimized</span>
                                            </div>
                                            <textarea 
                                                value={previewTab === 'INSTAGRAM' ? generatedPost.content?.instagram : previewTab === 'FACEBOOK' ? generatedPost.content?.facebook : generatedPost.content?.x_twitter}
                                                onChange={(e) => {
                                                    const updatedContent = { ...generatedPost.content, [previewTab.toLowerCase()]: e.target.value };
                                                    setGeneratedPost({ ...generatedPost, content: updatedContent as any });
                                                }}
                                                className="w-full bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-700 leading-relaxed font-medium focus:ring-1 focus:ring-brand-gold outline-none h-48 shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center px-4">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Hashtag Laboratory</span>
                                                <button 
                                                    onClick={handleOptimizeHashtags} 
                                                    disabled={optimizingHashtags}
                                                    className="flex items-center gap-2 text-[9px] font-bold text-brand-gold hover:text-brand-dark uppercase tracking-widest transition-all"
                                                >
                                                    {optimizingHashtags ? <div className="w-3 h-3 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : '✨ Optimize with Search Grounding'}
                                                </button>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] font-mono text-[11px] text-gray-500 leading-relaxed italic">
                                                {generatedPost.hashtags}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-6 pt-10">
                                            <button onClick={() => setGeneratedPost(null)} className="px-10 py-5 bg-white border border-gray-100 text-gray-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:text-brand-dark transition-all">Re-Synthesize</button>
                                            <button onClick={handleFinalize} className="px-16 py-5 bg-brand-dark text-brand-gold rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all active:scale-95 border border-brand-gold/30">Commit to Matrix</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-1000">
                                <div className="w-32 h-32 mb-12 relative">
                                    <div className="absolute inset-0 bg-brand-gold/5 rounded-full blur-2xl animate-pulse"></div>
                                    <svg className="w-full h-full text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M7 8h3v4H7V8z" /></svg>
                                </div>
                                <h3 className="text-4xl font-serif text-gray-200 italic font-bold">Neural Sandbox Standby</h3>
                                <p className="text-gray-400 text-sm mt-6 font-medium tracking-widest uppercase opacity-40">Define an objective to begin synthesis</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SocialCommandCenter: React.FC<{
    posts: SocialPost[];
    chefs: Chef[];
    eventLeads: EventLead[];
    onRefresh: () => void;
    isModalOpen: boolean;
    setIsModalOpen: (isOpen: boolean) => void;
}> = ({ posts, chefs, eventLeads, onRefresh, isModalOpen, setIsModalOpen }) => {

    const handleNewCampaign = async (postData: Partial<SocialPost>) => {
        const newPost: SocialPost = {
            id: Math.random().toString(36).substr(2, 9),
            scheduledAt: new Date(Date.now() + 86400000).toISOString(), // T+24h
            ...postData
        } as SocialPost;
        db.saveSocialPost(newPost);
        onRefresh();
        alert("Broadcast Protocol Queued: " + newPost.targetName);
    };

    const handleExecuteNow = (post: SocialPost) => {
        db.updateSocialPost({ ...post, status: 'PUBLISHED', publishedAt: new Date().toISOString() });
        onRefresh();
        alert(`Transmission Active: ${post.targetName}`);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 <div className="lg:col-span-3">
                    <DataTable<SocialPost>
                        title="Neural Velocity Ledger"
                        data={posts}
                        columns={[
                            { key: 'targetName', label: 'Strategic Node', render: (val, item) => (
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center font-bold text-brand-gold border border-brand-gold/10 text-xl font-serif shadow-inner">{val.charAt(0)}</div>
                                    <div>
                                        <span className="font-serif font-bold text-brand-dark block text-xl tracking-tight leading-tight">{val}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">{item.targetType}</span>
                                            <div className="flex items-center gap-1">
                                                {item.platforms.includes('INSTAGRAM') && <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>}
                                                {item.platforms.includes('FACEBOOK') && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                                                {item.platforms.includes('X_TWITTER') && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )},
                            { key: 'status', label: 'Matrix State', render: (val) => (
                                <span className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm transition-all ${val === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}`}>{val}</span>
                            )},
                            { key: 'scheduledAt', label: 'Deployment', render: (val, item) => (
                                <div className="space-y-1">
                                    <span className="font-bold text-gray-900 text-xs block">{new Date(val).toLocaleDateString()}</span>
                                    <span className="text-[9px] text-gray-400 uppercase tracking-widest">{new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            )},
                            { key: 'id', label: 'Transmission', render: (_, item) => item.status === 'SCHEDULED' && (
                                <button onClick={() => handleExecuteNow(item)} className="bg-brand-dark text-brand-gold px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all hover:bg-black hover:scale-105 active:scale-95 shadow-lg border border-brand-gold/20">Execute</button>
                            )}
                        ]}
                        actionButton={
                            <button onClick={() => setIsModalOpen(true)} className="bg-brand-dark text-brand-gold px-10 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all border border-brand-gold/20 flex items-center gap-3">
                                <span className="text-lg">+</span>
                                <span>Synthesize</span>
                            </button>
                        }
                    />
                 </div>
                 <div className="space-y-8">
                    <div className="bg-brand-dark p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5 h-full min-h-[500px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em] mb-12">Engagement Projections</h4>
                            <p className="text-3xl font-serif italic leading-relaxed mb-20 text-white/90">"Current campaign velocity indicates a <span className="text-brand-gold font-bold">+28%</span> resonance threshold in the London HNW segment."</p>
                            <div className="space-y-12 pt-16 border-t border-white/10">
                                <div>
                                    <div className="flex justify-between items-center mb-4"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Brand Prestige Index</span><span className="text-xs text-brand-gold font-bold">98.4</span></div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner"><div className="bg-brand-gold h-full w-[98%] shadow-[0_0_20px_rgba(212,175,55,0.6)]"></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-4"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Audience Resonance</span><span className="text-xs text-emerald-500 font-bold">Max Flow</span></div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner"><div className="bg-emerald-500 h-full w-[85%] shadow-[0_0_20px_rgba(16,185,129,0.6)]"></div></div>
                                </div>
                                <div className="pt-8">
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.4em] leading-relaxed">System recommendation: Orchestrate visual frequency for Chef Sebastian's Masterclass.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
            
            <SocialCampaignModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCampaignGenerated={handleNewCampaign}
                chefs={chefs}
                eventLeads={eventLeads}
            />
        </div>
    );
};

const MarketingStrategyNode: React.FC<{ onTrigger: () => void; results?: any; loading: boolean }> = ({ onTrigger, results, loading }) => {
    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
             <div className="flex flex-col lg:flex-row justify-between items-center gap-12 bg-white p-16 rounded-[4rem] border border-gray-100 shadow-sm">
                <div className="max-w-3xl">
                    <h3 className="text-6xl font-serif font-bold text-brand-dark tracking-tighter mb-4">Marketing Intelligence Stratum</h3>
                    <p className="text-gray-400 text-lg italic font-medium leading-relaxed">Synthesize ultra-high-end acquisition strategies for the elite culinary niche.</p>
                </div>
                <button onClick={onTrigger} disabled={loading} className="bg-brand-dark text-brand-gold px-16 py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-105 hover:bg-black transition-all active:scale-95 border border-brand-gold/30 whitespace-nowrap">
                  {loading ? <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : 'Generate Strategic Core'}
                </button>
             </div>

             {results ? (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-16">
                        <div className="bg-white p-16 rounded-[4rem] border border-gray-100 shadow-sm relative group overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                             <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.6em] block mb-12 flex items-center gap-4">Targeted Archetypes <div className="h-px bg-brand-gold/20 flex-grow"></div></span>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {results.targetedPersonas?.map((p: any, i: number) => (
                                    <div key={i} className="p-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 group/persona hover:bg-brand-gold/[0.02] transition-all">
                                        <h5 className="text-2xl font-serif font-bold text-brand-dark mb-4">{p.name}</h5>
                                        <div className="flex flex-wrap gap-2 mb-8">{p.traits?.map((t: string) => <span key={t} className="text-[9px] font-bold text-gray-400 bg-white border border-gray-100 px-3 py-1 rounded-lg uppercase tracking-widest">{t}</span>)}</div>
                                        <div className="pt-6 border-t border-gray-200/50 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CAC Coefficient</span>
                                            <span className="font-serif font-bold text-2xl text-brand-dark">£{p.acquisitionCost}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="bg-brand-dark p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                             <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                             <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.6em] block mb-12">Quarterly Strategic Overtures</span>
                             <div className="space-y-10">
                                {results.quarterlyGoals?.map((g: string, i: number) => (
                                    <div key={i} className="flex items-start gap-10 group/goal cursor-default">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-serif text-brand-gold font-bold text-2xl shrink-0 group-hover/goal:scale-110 transition-transform">0{i+1}</div>
                                        <p className="text-xl text-gray-300 leading-relaxed italic font-serif group-hover/goal:text-white transition-colors">"{g}"</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                    <div className="space-y-16">
                        <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em] block mb-12">SWOT Analysis Matrix</span>
                            <div className="space-y-12">
                                {['Strengths', 'Weaknesses', 'Opportunities', 'Threats'].map(k => (
                                    <div key={k}>
                                        <h6 className={`text-[11px] font-bold uppercase tracking-widest mb-6 ${k === 'Threats' ? 'text-rose-500' : k === 'Opportunities' ? 'text-emerald-500' : 'text-brand-dark'}`}>{k}</h6>
                                        <ul className="space-y-3">{results.swotAnalysis?.[k.toLowerCase()]?.map((s: string) => <li key={s} className="text-xs text-gray-500 italic flex items-center gap-3"><span className="w-1 h-1 bg-brand-gold rounded-full"></span> {s}</li>)}</ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-brand-light p-12 rounded-[4rem] border border-brand-gold/10">
                            <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em] block mb-10">Neural Content Pillars</span>
                            <div className="space-y-6">{results.contentPillars?.map((p: string) => <div key={p} className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark text-center">{p}</div>)}</div>
                        </div>
                    </div>
                 </div>
             ) : (
                <div className="p-60 text-center text-gray-200 italic font-serif text-4xl opacity-20 bg-white rounded-[5rem] border border-gray-50">
                    Strategic Node Standby
                </div>
             )}
        </div>
    );
}

const MarketDiscoveryModule: React.FC<{ 
    loading: boolean; 
    results: any; 
    onDiscover: (location: string) => void 
}> = ({ loading, results, onDiscover }) => {
    const [locInput, setLocInput] = useState('London');

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-12 mb-16">
                    <div className="max-w-2xl">
                        <h3 className="text-6xl font-serif font-bold text-brand-dark tracking-tighter mb-4">Discovery Radar</h3>
                        <p className="text-gray-400 text-lg italic font-medium leading-relaxed">Execute real-time competitive landscaping using high-intelligence search grounding.</p>
                    </div>
                    <div className="flex gap-4 w-full lg:w-auto">
                        <input 
                            value={locInput} 
                            onChange={e => setLocInput(e.target.value)} 
                            className="flex-grow lg:w-64 p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:border-brand-gold outline-none shadow-sm"
                            placeholder="Target Territory..."
                        />
                        <button 
                            onClick={() => onDiscover(locInput)} 
                            disabled={loading || !locInput} 
                            className="bg-brand-dark text-brand-gold px-12 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-105 hover:bg-black transition-all active:scale-95 border border-brand-gold/30 whitespace-nowrap disabled:opacity-30"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : 'Synchronize Intelligence'}
                        </button>
                    </div>
                </div>

                {results ? (
                    <div className="space-y-20 animate-in slide-in-from-bottom-10 duration-1000">
                        {/* Executive KPIs */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="bg-brand-dark p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                                <span className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.5em] block mb-10">Market Saturation Index</span>
                                <div className="flex items-end gap-6 mb-8">
                                    <span className="text-8xl font-serif font-bold text-brand-gold leading-none tracking-tighter">{results.saturationIndex || 68}%</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pb-2">Density Profile</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="bg-brand-gold h-full transition-all duration-2000 shadow-[0_0_20px_rgba(212,175,55,1)]" style={{width: `${results.saturationIndex || 68}%`}}></div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 bg-brand-light p-12 rounded-[4rem] border border-brand-gold/10 flex flex-col justify-center">
                                <span className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.5em] block mb-8 flex items-center gap-4">Executive Synthesis <div className="h-px bg-brand-gold/20 flex-grow"></div></span>
                                <p className="text-3xl text-brand-dark italic leading-[1.6] font-serif">"{results.executiveSummary}"</p>
                            </div>
                        </div>

                        {/* Competitor Benchmarks */}
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] block mb-12 text-center">Competitive Alpha Ledger</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {results.competitorBenchmarks?.map((comp: any, i: number) => (
                                    <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                                        <h5 className="text-xl font-serif font-bold text-brand-dark mb-4 group-hover:text-brand-gold transition-colors">{comp.name}</h5>
                                        <div className="space-y-4 pt-6 border-t border-gray-50">
                                            <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Strength</span><span className="text-[10px] font-bold text-brand-dark">{comp.keyStrength}</span></div>
                                            <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Valuation</span><span className="text-[10px] font-bold text-brand-gold">{comp.pricePoint}</span></div>
                                            <div className="flex justify-between items-center"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cap Share</span><span className="text-[10px] font-bold text-emerald-500">{comp.marketShare}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trends & Expansion Opportunities */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                            <div className="space-y-10">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] block flex items-center gap-4">Emerging Pulse <div className="h-px bg-gray-100 flex-grow"></div></span>
                                <div className="space-y-6">
                                    {results.emergingTrends?.map((trend: any, i: number) => (
                                        <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex items-start gap-8 group hover:bg-white hover:shadow-xl transition-all">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-bold text-brand-gold border border-brand-gold/10 text-xl font-serif">{i+1}</div>
                                            <div>
                                                <h6 className="font-bold text-brand-dark text-lg mb-2">{trend.trend}</h6>
                                                <p className="text-sm text-gray-500 leading-relaxed italic">{trend.description}</p>
                                                <span className="inline-block mt-4 px-4 py-1.5 bg-brand-gold/10 text-brand-gold rounded-full text-[9px] font-bold uppercase tracking-widest">{trend.momentum} Momentum</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-10">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] block flex items-center gap-4">Strategic Expansion Nodes <div className="h-px bg-gray-100 flex-grow"></div></span>
                                <div className="space-y-6">
                                    {results.expansionOpportunities?.map((opp: any, i: number) => (
                                        <div key={i} className="p-8 bg-brand-dark rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <h6 className="font-serif font-bold text-white text-2xl tracking-tight">{opp.location}</h6>
                                                    <span className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full border border-white/10">Viability High</span>
                                                </div>
                                                <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">"{opp.reasoning}"</p>
                                                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Revenue Alpha:</span>
                                                    <span className="text-xl font-serif font-bold text-emerald-400">{opp.estimatedRevenuePotential}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Grounding Sources */}
                        {results.groundingSources?.length > 0 && (
                            <div className="pt-16 border-t border-gray-100">
                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.4em] block mb-8">Intelligence Source Audit Handshake</span>
                                <div className="flex flex-wrap gap-4">
                                    {results.groundingSources.map((url: string, i: number) => (
                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-mono text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all truncate max-w-[250px]">
                                            {url.replace('https://', '').split('/')[0]}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-60 text-center opacity-10">
                        <svg className="w-32 h-32 mx-auto mb-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M9 20l-5.447-2.724A2 2 0 013 15.483V7.086a2 2 0 011.132-1.803l6.586-3.293a2 2 0 011.564 0l6.586 3.293A2 2 0 0120 7.086v8.397a2 2 0 01-1.132 1.803L15 20m-3-1l-3-1.5m0-11l3 1.5m0 0V20"></path></svg>
                        <h4 className="text-5xl font-serif text-gray-500 italic">Satellite Array Standby</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

const NavTooltip: React.FC<{ label: string; visible: boolean }> = ({ label, visible }) => (
    <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-brand-dark border border-white/10 text-brand-gold px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-2xl pointer-events-none transition-all duration-300 z-[100] whitespace-nowrap ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
        {label}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full border-[6px] border-transparent border-b-brand-dark"></div>
    </div>
);

const AdminDashboard: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, any>>({});
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  
  // Platform Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [chefRequests, setChefRequests] = useState<ChefRequest[]>([]);
  const [recruitmentLeads, setRecruitmentLeads] = useState<RecruitmentLead[]>([]);
  const [eventLeads, setEventLeads] = useState<EventLead[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  
  const [selectedChefIds, setSelectedChefIds] = useState<string[]>([]);
  const [isSebastianOpen, setIsSebastianOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBookings(db.getBookings());
    setUsers(db.getUsers());
    setChefs(db.getCachedChefs());
    setChefRequests(db.getChefRequests());
    setRecruitmentLeads(db.getRecruitmentLeads());
    setEventLeads(db.getEventLeads());
    setSystemLogs(db.getSystemLogs());
    setSocialPosts(db.getSocialPosts());
  };

  const triggerAI = async (id: string, fn: () => Promise<any>) => {
    setLoadingAI(id);
    db.addSystemLog(`Admin initiating AI synthesis for [${id}]...`);
    try {
      const res = await fn();
      setAiResults(prev => ({ ...prev, [id]: res }));
      db.addSystemLog(`AI synthesis for [${id}] complete.`);
      refreshData();
    } catch (e: any) {
      const errorMsg = handleAIServiceError(e);
      db.addSystemLog(`AI ERROR [${id}]: ${errorMsg}`);
      alert(errorMsg);
    } finally {
      setLoadingAI(null);
    }
  };

  const gtv = useMemo(() => bookings.reduce((s, b) => s + b.totalPrice, 0), [bookings]);

  const renderModule = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AdminStat label="Total GTV" value={`£${gtv.toLocaleString()}`} trend="+14.2%" />
              <AdminStat label="Verified Users" value={users.length.toString()} trend="+5.8%" color="emerald" />
              <AdminStat label="Partner Network" value={chefs.length.toString()} trend="-2.1%" color="rose" />
              <AdminStat label="Event Leads" value={eventLeads.length.toString()} trend="+22.0%" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm h-[500px] flex items-center justify-center italic text-gray-300 font-serif text-3xl relative overflow-hidden group">
                <div className="z-10 text-center">
                    <p>Revenue Propagation Matrix...</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em] mt-6">Syncing Global High-Density Nodes</p>
                </div>
              </div>
              <div className="bg-brand-dark p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/5">
                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-20 h-20 rounded-2xl border border-brand-gold/40 overflow-hidden shadow-2xl p-1 bg-white/5">
                      <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] mb-1">Sebastian AI</h4>
                      <p className="text-2xl font-serif font-bold tracking-tight">System Director</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-lg leading-relaxed mb-12 italic font-serif">"Platform velocity is optimal. I recommend scaling partner bandwidth in the Greater London hub to preserve high-fidelity matching."</p>
                  <button onClick={() => setIsSebastianOpen(true)} className="w-full bg-brand-gold text-brand-dark py-6 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-2xl border border-brand-gold">Activate Sebastian Interface</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ANALYTICS':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-700">
            <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm space-y-12">
               <h3 className="text-4xl font-serif font-bold text-brand-dark tracking-tighter">Performance Matrix</h3>
               <div className="space-y-12">
                 {[{l: 'Conversion Velocity', v: '4.8%'}, {l: 'Average Order Value', v: '£942'}, {l: 'Chef Retention', v: '92%'}].map(m => (
                   <div key={m.l} className="flex justify-between items-end border-b border-gray-50 pb-8 group">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] group-hover:text-brand-gold transition-colors">{m.l}</span>
                     <span className="text-5xl font-serif font-bold text-brand-dark group-hover:scale-110 transition-transform origin-right">{m.v}</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="bg-brand-light p-12 rounded-[4rem] border border-brand-gold/10 flex flex-col justify-between shadow-inner relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.3em] mb-8">Traffic Intelligence</h4>
                 <p className="text-3xl text-brand-dark font-serif italic leading-relaxed mb-16">"{aiResults.TRAFFIC?.competitiveLandscape || 'Initialize platform scan to synthesize real-time market trends.'}"</p>
               </div>
               <button onClick={() => triggerAI('TRAFFIC', () => generateTrafficInsights('London Luxury Hub'))} disabled={loadingAI === 'TRAFFIC'} className="bg-brand-dark text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-2xl">
                 {loadingAI === 'TRAFFIC' ? 'Processing Node...' : 'Execute Deep Analysis'}
               </button>
            </div>
          </div>
        );

      case 'MARKETING':
        return <MarketingStrategyNode results={aiResults.STRATEGY} loading={loadingAI === 'STRATEGY'} onTrigger={() => triggerAI('STRATEGY', () => generateMarketingStrategy('Elite Culinary Expansion 2024'))} />;

      case 'SOCIAL_HUB':
        return <SocialCommandCenter 
            posts={socialPosts} 
            chefs={chefs} 
            eventLeads={eventLeads}
            onRefresh={refreshData}
            isModalOpen={isCampaignModalOpen}
            setIsModalOpen={setIsCampaignModalOpen}
        />;

      case 'RECRUITMENT':
        return (
            <div className="h-full space-y-12">
                <DataTable<ChefRequest> 
                    title="Partner Acquisition Pipeline" 
                    data={chefRequests} 
                    columns={[
                        { key: 'name', label: 'Applicant Node', render: (val, item) => (
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-brand-light flex items-center justify-center font-bold text-brand-gold border border-brand-gold/20 text-2xl font-serif shadow-inner">{val.charAt(0)}</div>
                                <div><span className="font-serif font-bold text-brand-dark block text-2xl tracking-tight">{val}</span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">{item.niche}</span></div>
                            </div>
                        )},
                        { key: 'experience', label: 'Expertise (Years)', render: v => <span className="font-serif font-bold text-3xl text-brand-dark">{v}y</span> },
                        { key: 'appliedAt', label: 'Signal Received', render: v => <span className="text-gray-900 font-bold text-xs">{new Date(v).toLocaleDateString()}</span> },
                        { key: 'status', label: 'Vetting Protocol', render: v => <span className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm ${v === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{v}</span> }
                    ]} 
                    onRowClick={(item) => triggerAI('VETTING', () => vetChefApplication(item))}
                    actionButton={<button className="bg-brand-gold text-brand-dark px-10 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl">Synthesize Recruitment Leads</button>}
                />
                {aiResults.VETTING && (
                    <div className="p-12 bg-brand-dark rounded-[4rem] text-white shadow-2xl animate-in slide-in-from-bottom-10">
                        <h4 className="text-3xl font-serif font-bold mb-8 text-brand-gold">AI Vetting Strategic Assessment</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div>
                                <p className="text-2xl font-serif italic leading-relaxed mb-10">"{aiResults.VETTING.recommendation}"</p>
                                <div className="flex items-center gap-6">
                                    <div className="text-6xl font-serif font-bold text-brand-gold">{aiResults.VETTING.score}%</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">Suitability Coefficient</div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] block mb-4">Risk Factors</span>
                                    <ul className="space-y-2">{aiResults.VETTING.riskFactors?.map((rf: string) => <li key={rf} className="text-xs text-rose-300 italic">» {rf}</li>)}</ul>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] block mb-4">Suggested Badges</span>
                                    <div className="flex flex-wrap gap-2">{aiResults.VETTING.suggestedBadges?.map((b: string) => <span key={b} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest">{b}</span>)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );

      case 'TALENT_PIPELINE':
        const talentOutreach = aiResults.TALENT_OUTREACH;
        const discoveryResult = aiResults.TALENT_DISCOVERY;
        return (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm sticky top-8 space-y-12">
                        <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-8">AI Discovery Engine</h4>
                            <div className="space-y-6">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em] block px-3">Extraction Path</label>
                                <input 
                                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-mono text-gray-400 focus:outline-none focus:border-brand-gold"
                                    placeholder="Paste Source URL..."
                                />
                                <button 
                                    onClick={async () => {
                                        triggerAI('TALENT_DISCOVERY', async () => {
                                            const niche = 'Freelance Elite Chef';
                                            const result = await generateTalentOutreach(niche);
                                            return result;
                                        });
                                    }}
                                    disabled={loadingAI === 'TALENT_DISCOVERY'}
                                    className="w-full bg-brand-dark text-brand-gold py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                                >
                                    {loadingAI === 'TALENT_DISCOVERY' ? <div className="w-3 h-3 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div> : 'Extract Leads'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-8">Outreach Synthesis</h4>
                            <div className="space-y-6">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em] block px-3">Elite Specializations</label>
                                {['Omakase Master', 'Michelin Pastry', 'Plant-Based Gastronomy', 'Nordic Foraging'].map(niche => (
                                    <button 
                                        key={niche} 
                                        onClick={() => triggerAI('TALENT_OUTREACH', () => generateTalentOutreach(niche))} 
                                        disabled={loadingAI === 'TALENT_OUTREACH'}
                                        className="w-full text-left p-6 rounded-[2rem] border border-gray-100 hover:border-brand-gold hover:bg-brand-gold/5 transition-all group flex justify-between items-center"
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-brand-dark">{niche}</span>
                                        <svg className="w-4 h-4 text-brand-gold opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-3 space-y-10">
                    <DataTable<RecruitmentLead> 
                        title="Talent Outreach Registry" 
                        data={recruitmentLeads} 
                        columns={[
                            { key: 'name', label: 'Target Talent', render: (val, item) => (
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center font-bold text-brand-gold border border-brand-gold/10 text-lg font-serif">{val.charAt(0)}</div>
                                    <div><span className="font-bold text-brand-dark block text-base">{val}</span><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.niche}</span></div>
                                </div>
                            )},
                            { key: 'status', label: 'Protocol State', render: v => <span className={`px-5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border shadow-sm ${v === 'SIGNED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>{v}</span> },
                            { key: 'source', label: 'Inbound Source', render: v => <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px] block">{v}</span> }
                        ]} 
                    />

                    {(talentOutreach || discoveryResult) && (
                        <div className="bg-brand-dark rounded-[4rem] p-16 text-white shadow-2xl animate-in slide-in-from-right duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                            <div className="relative z-10 space-y-16">
                                <div>
                                    <h4 className="text-3xl font-serif font-bold mb-6 text-brand-gold tracking-tight">Strategic Outreach Intelligence</h4>
                                    <p className="text-2xl text-gray-200 italic leading-relaxed font-serif">"{(talentOutreach || discoveryResult).valueProposition}"</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-8">
                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em]">Targeted Channels</span>
                                        <div className="flex flex-wrap gap-4">{(talentOutreach || discoveryResult).recruitmentChannels?.map((c: string) => <span key={c} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest">{c}</span>)}</div>
                                    </div>
                                    <div className="space-y-8">
                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em]">Communication Payload Templates</span>
                                        <div className="space-y-6">
                                            {(talentOutreach || discoveryResult).outreachTemplates?.map((t: any, i: number) => (
                                                <div key={i} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:bg-white/10 transition-all">
                                                    <p className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.3em] mb-4">Channel: {t.channel}</p>
                                                    <p className="text-sm font-bold text-white mb-2">{t.subject || 'Direct Signal'}</p>
                                                    <p className="text-xs text-gray-400 leading-relaxed italic font-serif h-24 overflow-y-auto no-scrollbar">"{t.message}"</p>
                                                    <button className="mt-6 text-[10px] font-bold text-brand-gold uppercase tracking-widest hover:text-white transition-colors">Clone Payload »</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             </div>
          </div>
        );

      case 'CHEFS':
        return (
            <DataTable<Chef> 
                title="Talent Infrastructure" 
                data={chefs} 
                selectable={true} 
                selectedIds={selectedChefIds} 
                onSelectionChange={setSelectedChefIds} 
                columns={[
                    { key: 'name', label: 'Partner Identity', render: (val, item) => (
                        <div className="flex items-center gap-8">
                            <img src={item.imageUrl} className="w-20 h-20 rounded-[1.8rem] object-cover shadow-2xl border-4 border-white relative z-10" />
                            <div><span className="font-serif font-bold text-brand-dark block text-2xl tracking-tight">{val}</span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">{item.location}</span></div>
                        </div>
                    )},
                    { key: 'rating', label: 'Acclaim', render: v => <div className="flex items-center gap-3"><span className="text-brand-gold text-2xl">★</span><span className="font-serif font-bold text-2xl text-brand-dark">{v}</span></div> },
                    { key: 'minPrice', label: 'Valuation', render: v => <span className="font-serif font-bold text-3xl text-brand-dark">£{v}</span> },
                    { key: 'eventsCount', label: 'History', render: v => <span className="font-bold text-brand-dark text-base">{v} Events</span> }
                ]} 
            />
        );

      case 'ORDERS':
        return (
            <div className="h-full space-y-12 animate-in slide-in-from-right duration-700">
                <DataTable<Booking> 
                    title="Experience Ledger" 
                    data={bookings} 
                    columns={[
                        { key: 'id', label: 'TX ID', render: v => <span className="font-mono text-[10px] text-gray-400">#{v.toUpperCase()}</span> },
                        { key: 'chefName', label: 'Partner', render: (v, item) => (
                            <div className="flex items-center gap-4">
                                <img src={item.chefImage} className="w-10 h-10 rounded-full object-cover" />
                                <span className="font-bold text-brand-dark">{v}</span>
                            </div>
                        )},
                        { key: 'menuName', label: 'Selection', render: v => <span className="italic font-serif font-medium text-gray-600">{v}</span> },
                        { key: 'totalPrice', label: 'GTV', render: v => <span className="font-bold text-brand-dark">£{v.toLocaleString()}</span> },
                        { key: 'status', label: 'Status', render: v => (
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${v === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{v}</span>
                        )},
                        { key: 'id', label: 'Action', render: (_, item) => item.status === 'CONFIRMED' && (
                             <button onClick={() => triggerAI('ORDER_UPDATE', async () => {
                                 const updated = { ...item, status: 'COMPLETED' as const };
                                 await db.updateBooking(updated);
                                 refreshData();
                                 return { success: true };
                             })} className="text-[9px] font-bold text-brand-gold hover:text-brand-dark uppercase tracking-widest transition-colors">Finalize TX</button>
                        )}
                    ]}
                />
            </div>
        );

      case 'CUSTOMERS':
        return (
            <div className="h-full space-y-12 animate-in slide-in-from-right duration-700">
                <DataTable<User> 
                    title="Member Registry" 
                    data={users} 
                    columns={[
                        { key: 'avatar', label: 'Identity', render: (v, item) => (
                            <div className="flex items-center gap-6">
                                <img src={v} className="w-12 h-12 rounded-xl object-cover" />
                                <div><span className="font-bold text-brand-dark block text-base">{item.name}</span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.email}</span></div>
                            </div>
                        )},
                        { key: 'role', label: 'Status', render: v => <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[9px] font-bold uppercase tracking-widest text-gray-500">{v}</span> },
                        { key: 'totalSpent', label: 'Total Contribution', render: v => <span className="font-serif font-bold text-2xl text-brand-dark">£{(v || 0).toLocaleString()}</span> },
                        { key: 'lastActive', label: 'Pulse', render: v => <span className="text-[10px] text-gray-400 font-medium">{v ? new Date(v).toLocaleDateString() : 'N/A'}</span> }
                    ]}
                />
            </div>
        );

      case 'FINANCE':
        const budget = aiResults.BUDGET;
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 animate-in fade-in duration-700 h-full">
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm sticky top-8">
                  <h3 className="text-3xl font-serif font-bold text-brand-dark mb-10 tracking-tight">Capital Stratum</h3>
                  <button onClick={() => triggerAI('BUDGET', () => generateBudgetStrategy(gtv, gtv * 0.4))} disabled={loadingAI === 'BUDGET'} className="w-full bg-brand-dark text-brand-gold py-6 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-2xl hover:bg-black transition-all active:scale-95 border border-brand-gold/20">
                    {loadingAI === 'BUDGET' ? 'Auditing Ledger...' : 'Synthesize Margin Analysis'}
                  </button>
                </div>
             </div>
             <div className="lg:col-span-3">
                {budget ? (
                  <div className="bg-white p-16 rounded-[4rem] border border-gray-100 shadow-sm space-y-20 animate-in slide-in-from-right duration-1000">
                     <div>
                        <h4 className="text-4xl font-serif font-bold mb-8 tracking-tighter text-brand-dark">Strategic Margin Synthesis</h4>
                        <p className="text-2xl text-gray-600 italic leading-[1.8] font-serif border-l-8 border-brand-gold/20 pl-16 py-4">"{budget.marginAnalysis}"</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        <div className="space-y-10">
                          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em]">Operational Optimization</span>
                          <ul className="space-y-6">{budget.costOptimizationSteps?.map((s: string, i: number) => <li key={i} className="text-base font-medium text-gray-700 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 leading-relaxed italic">» {s}</li>)}</ul>
                        </div>
                        <div className="space-y-10">
                          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em]">Reinvestment Paradigm</span>
                          <div className="bg-brand-gold/5 p-12 rounded-[3.5rem] border border-brand-gold/10 text-brand-dark leading-relaxed font-serif italic text-2xl shadow-inner group">
                             "{budget.reinvestmentAdvice}"
                          </div>
                        </div>
                     </div>
                  </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center italic text-gray-300 font-serif text-3xl opacity-20 py-60 bg-white rounded-[4rem]">
                        Financial Intelligence Node Standby...
                    </div>
                )}
             </div>
          </div>
        );

      case 'MARKET_DISCOVERY':
        return <MarketDiscoveryModule 
            loading={loadingAI === 'MARKET'} 
            results={aiResults.MARKET} 
            onDiscover={(loc) => triggerAI('MARKET', () => generateMarketDiscovery(loc))} 
        />;

      case 'FORECASTING':
        const forecast = aiResults.FORECAST;
        return (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="flex flex-col md:flex-row justify-between items-center px-6 gap-10">
                <div>
                    <h3 className="text-5xl font-serif font-bold text-brand-dark tracking-tighter">Predictive Growth</h3>
                    <p className="text-gray-400 font-medium italic mt-2">12-month simulation based on platform velocity.</p>
                </div>
                <button onClick={() => triggerAI('FORECAST', () => generateGrowthForecast(bookings))} disabled={loadingAI === 'FORECAST'} className="bg-brand-dark text-brand-gold px-16 py-6 rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95">
                  {loadingAI === 'FORECAST' ? 'Initializing Simulation...' : 'Execute Forecasting Engine'}
                </button>
             </div>
             {forecast ? (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                      {forecast.projections?.map((p: any, i: number) => (
                        <div key={i} className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                           <div className="relative z-10">
                               <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em] mb-8 block">{p.month} Projection</span>
                               <span className="text-6xl font-serif font-bold text-brand-dark block mb-4 group-hover:text-brand-gold transition-colors">£{(p.estimatedRevenue || 0).toLocaleString()}</span>
                           </div>
                           <div className="relative z-10 border-t border-gray-50 pt-8">
                               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Growth Driver</span>
                               <p className="text-sm font-bold text-gray-700 italic leading-relaxed">{p.growthDrivers}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-brand-dark p-12 rounded-[5rem] text-white shadow-2xl space-y-16 relative overflow-hidden group border border-white/5">
                        <div className="relative z-10">
                          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.6em] block mb-12">Executive Strategic Summary</span>
                          <p className="text-3xl font-serif italic leading-[1.8] mb-20 text-white/90">"{forecast.executiveSummary}"</p>
                          <div className="space-y-8 pt-16 border-t border-white/10">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] block mb-6">Strategic Pivots</span>
                            {forecast.strategicPivots?.map((pv: string, i: number) => (
                                <div key={i} className="flex items-start gap-5 group/pivot cursor-default">
                                    <span className="text-brand-gold font-bold mt-1 group-hover/pivot:translate-x-2 transition-transform">»</span>
                                    <span className="text-xs text-brand-gold/70 group-hover/pivot:text-white transition-colors leading-relaxed font-medium italic">{pv}</span>
                                </div>
                            ))}
                          </div>
                        </div>
                    </div>
                 </div>
             ) : (
                 <div className="p-60 text-center text-gray-200 italic font-serif text-3xl opacity-20 bg-white rounded-[5rem]">
                    Predictive Node Standby
                 </div>
             )}
          </div>
        );

      case 'DATA_MANAGEMENT':
        return (
            <div className="h-full space-y-12 animate-in slide-in-from-right duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm">
                            <h3 className="text-3xl font-serif font-bold text-brand-dark mb-10 tracking-tight">System Telemetry</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-4">
                                {systemLogs.map((log, i) => (
                                    <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-6 group hover:bg-white hover:border-brand-gold/20 transition-all">
                                        <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(212,175,55,1)]"></div>
                                        <p className="font-mono text-[11px] text-gray-600 leading-relaxed">{log}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-8">
                         <div className="bg-brand-dark p-10 rounded-[3rem] text-white border border-white/5">
                            <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] mb-8">Node Health</h4>
                            <div className="space-y-8">
                                {[
                                    { l: 'Core AI Engine', v: 'OPTIMAL', c: 'text-emerald-400' },
                                    { l: 'Global Sync', v: 'ACTIVE', c: 'text-emerald-400' },
                                    { l: 'Search Grounding', v: 'READY', c: 'text-blue-400' },
                                    { l: 'Matrix Integrity', v: '99.9%', c: 'text-brand-gold' }
                                ].map((h, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{h.l}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${h.c}`}>{h.v}</span>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        );

      case 'EMAILS':
      case 'SMS':
        const channelType = activeTab === 'EMAILS' ? 'EMAIL' : 'SMS';
        const commsContent = aiResults[channelType];
        return (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-20">
                    <div className="lg:w-1/3 space-y-12">
                        <div>
                            <h3 className="text-4xl font-serif font-bold text-brand-dark tracking-tight">Communication</h3>
                            <p className="text-gray-400 text-sm italic mt-2">Generate high-prestige templates for {channelType.toLowerCase()} channels.</p>
                        </div>
                        <div className="space-y-6">
                            {['Partner Outreach', 'Customer Recovery', 'Luxury Lifestyle Upsell'].map(p => (
                                <button key={p} onClick={() => triggerAI(channelType, () => generateCommTemplate(p, channelType as any))} disabled={loadingAI === channelType} className="w-full text-left p-10 rounded-[2.5rem] border border-gray-50 hover:border-brand-gold hover:bg-brand-gold/5 transition-all group flex justify-between items-center shadow-sm">
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-brand-dark transition-colors">{p}</span>
                                    <svg className="w-5 h-5 text-brand-gold opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-2/3 bg-gray-50 rounded-[4rem] p-16 relative min-h-[700px] border border-gray-100 shadow-inner group">
                        {commsContent ? (
                            <div className="space-y-16 animate-in slide-in-from-right duration-700">
                                {channelType === 'EMAIL' && (
                                    <div className="space-y-4">
                                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] block">Subject</span>
                                        <p className="text-3xl font-serif font-bold text-brand-dark tracking-tight leading-tight">{commsContent.subject}</p>
                                    </div>
                                )}
                                <div className="space-y-6">
                                  <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em] block">Payload</span>
                                  <div className="bg-white p-16 rounded-[3.5rem] shadow-2xl border border-gray-100 text-lg leading-[2.2] text-gray-600 font-medium whitespace-pre-wrap italic font-serif relative">
                                      {commsContent.body}
                                  </div>
                                </div>
                                <div className="flex justify-end pt-10"><button className="px-16 py-6 bg-brand-dark text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">Broadcast Protocol</button></div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center italic text-gray-300 font-serif text-3xl opacity-20">
                                Synthesize communications to visualize templates.
                            </div>
                        )}
                    </div>
                </div>
             </div>
          </div>
        );

      default: return <div className="p-60 text-center text-gray-200 italic font-serif text-3xl opacity-20">Strategic Interface Standby...</div>;
    }
  };

  const navGroups = [
    { title: 'Intelligence', items: [
        { id: 'DASHBOARD', label: 'Console', icon: 'M4 12h16M4 6h16M4 18h16' },
        { id: 'ANALYTICS', label: 'Matrix', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2' },
        { id: 'FORECASTING', label: 'Predictive', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { id: 'MARKET_DISCOVERY', label: 'Radar', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }
    ]},
    { title: 'Growth', items: [
        { id: 'MARKETING', label: 'Strategy', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { id: 'SOCIAL_HUB', label: 'Social', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6' },
        { id: 'EMAILS', label: 'Protocol', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
    ]},
    { title: 'Talent', items: [
        { id: 'RECRUITMENT', label: 'Alpha', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857' },
        { id: 'TALENT_PIPELINE', label: 'Pipeline', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { id: 'CHEFS', label: 'Partners', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z' }
    ]},
    { title: 'Operations', items: [
        { id: 'ORDERS', label: 'Ledger', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'CUSTOMERS', label: 'Members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z' },
        { id: 'FINANCE', label: 'Capital', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2' },
        { id: 'DATA_MANAGEMENT', label: 'System', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2' }
    ]}
  ];

  const adminUser = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-brand-light/40 flex flex-col font-sans text-brand-dark overflow-hidden relative selection:bg-brand-gold/20">
      
      {/* Refactored Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-[#020204] text-white flex items-center justify-between px-8 h-20 border-b border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-8">
            <div className="w-12 h-12 bg-brand-gold rounded-2xl flex items-center justify-center text-brand-dark font-serif font-bold text-3xl shadow-xl">L</div>
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
        </div>

        <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2" role="menubar">
           {navGroups.map((group, gIdx) => (
             <React.Fragment key={gIdx}>
                <div className="flex items-center space-x-1">
                   {group.items.map((item) => (
                      <div key={item.id} className="relative group/nav">
                          <button 
                            onMouseEnter={() => setHoveredNavItem(item.id)}
                            onMouseLeave={() => setHoveredNavItem(null)}
                            onClick={() => setActiveTab(item.id as AdminTab)} 
                            role="menuitem"
                            aria-label={item.label}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all relative ${activeTab === item.id ? 'bg-white/10 text-brand-gold shadow-inner border border-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`} 
                          >
                             <svg className={`w-5 h-5 flex-shrink-0 transition-colors ${activeTab === item.id ? 'text-brand-gold' : 'group-hover/nav:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon}></path></svg>
                             {activeTab === item.id && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-brand-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,1)]"></div>
                             )}
                          </button>
                          <NavTooltip label={item.label} visible={hoveredNavItem === item.id} />
                      </div>
                   ))}
                </div>
                {gIdx < navGroups.length - 1 && <div className="h-6 w-px bg-white/5 mx-4 hidden md:block"></div>}
             </React.Fragment>
           ))}
        </nav>

        <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSebastianOpen(true)}
              className="w-10 h-10 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold rounded-full flex items-center justify-center hover:bg-brand-gold hover:text-brand-dark transition-all shadow-xl group/seb"
            >
                <svg className="w-5 h-5 group-hover/seb:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <button onClick={onExit} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-rose-400 transition-all hover:bg-white/5 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m4 4H7"></path></svg>
            </button>
        </div>
      </div>

      <div className="flex-grow pt-32 p-10 md:p-24 overflow-y-auto h-screen relative">
         <div className="max-w-7xl mx-auto pb-60">
            <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-16 gap-12">
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.5em]">System Authorization Node</span>
                        <div className="h-px w-12 bg-brand-gold/30"></div>
                    </div>
                    <h2 className="text-6xl md:text-8xl font-serif font-bold text-brand-dark leading-none tracking-tighter animate-in slide-in-from-left duration-1000">
                        {activeTab.replace(/_/g, ' ').toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </h2>
                </div>
                <div className="flex items-center gap-10 animate-in fade-in duration-1000">
                   <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-1">Director Identity</p>
                      <p className="font-bold text-brand-dark text-xl">{adminUser?.name || 'Administrator'}</p>
                   </div>
                   <div className="w-16 h-16 rounded-2xl border-2 border-brand-gold/20 p-1 shadow-2xl overflow-hidden bg-brand-dark">
                      <img src={adminUser?.avatar || "https://ui-avatars.com/api/?name=Admin&background=0f172a&color=d4af37"} className="w-full h-full rounded-xl object-cover" />
                   </div>
                </div>
            </div>
            {renderModule()}
         </div>
      </div>

      {isSebastianOpen && (
        <ChefSebastianLive 
          onClose={() => setIsSebastianOpen(false)} 
          currentUser={adminUser} 
          isAdmin={true} 
          initialPersona="Strategist"
        />
      )}
    </div>
  );
};

export default AdminDashboard;
