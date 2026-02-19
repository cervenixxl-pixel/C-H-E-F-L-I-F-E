
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import LoadingScreen from './LoadingScreen';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@luxeplate.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // In this deep dev mode, we ensure admin access
      const user = await authService.login(email, password);
      if (user.role !== 'ADMIN') {
        setError('CRITICAL: Access Denied. Administrative Signature Required.');
        setLoading(false);
        return;
      }
      onLoginSuccess(user);
    } catch (err) {
      setError('AUTHENTICATION FAILURE: Identity could not be verified.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Initializing High-Security Terminal..." />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020203] px-4 relative overflow-hidden">
      {/* Dynamic Background Matrix */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#d4af3710,transparent_70%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-gold/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg animate-in zoom-in-95 duration-1000">
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            <div className="text-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-dark to-black rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl relative group overflow-hidden">
                    <div className="absolute inset-0 bg-brand-gold/10 group-hover:bg-brand-gold/20 transition-all duration-700"></div>
                    <h1 className="text-5xl font-serif font-bold text-brand-gold relative z-10 drop-shadow-2xl">L</h1>
                </div>
                <h2 className="text-3xl font-serif font-bold text-white tracking-[0.1em] mb-3 uppercase">Master Portal</h2>
                <div className="flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-brand-gold/30"></span>
                    <p className="text-brand-gold/60 text-[10px] font-bold uppercase tracking-[0.4em]">Strategic Control Center</p>
                    <span className="h-px w-8 bg-brand-gold/30"></span>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-bold uppercase tracking-widest text-center animate-in shake duration-500">
                    <svg className="w-4 h-4 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2 group-focus-within:text-brand-gold transition-colors">Credential Index</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-white placeholder-gray-700 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all text-sm font-medium shadow-inner"
                            placeholder="Authorized ID"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="group">
                        <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-3 ml-2 group-focus-within:text-brand-gold transition-colors">Secure Key</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 px-8 text-white placeholder-gray-700 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/50 transition-all text-sm font-medium shadow-inner"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-brand-gold text-brand-dark font-bold py-6 rounded-2xl shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:bg-white transition-all transform active:scale-[0.98] uppercase tracking-[0.3em] text-[11px] relative overflow-hidden group/btn"
                >
                    <span className="relative z-10">Authorize Session</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                </button>
            </form>

            <div className="mt-12 text-center border-t border-white/5 pt-10">
                <button 
                    onClick={onCancel}
                    className="text-[9px] font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-[0.4em] flex items-center justify-center mx-auto group/back"
                >
                    <svg className="w-4 h-4 mr-3 transform group-hover/back:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Terminate Handshake
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
