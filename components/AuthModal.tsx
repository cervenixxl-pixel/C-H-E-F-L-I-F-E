
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onAdminAccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess, onAdminAccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'DINER' | 'CHEF'>('DINER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await authService.login(formData.email, formData.password);
      } else {
        user = await authService.register(formData.name, formData.email, formData.password, role);
      }
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-brand-dark p-8 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-gold/10 to-transparent"></div>
            <h3 className="text-3xl font-serif font-bold text-white relative z-10">
                {isLogin ? 'Welcome Back' : 'Join LuxePlate'}
            </h3>
            <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mt-2 relative z-10">
                {isLogin ? 'Access your culinary world' : 'Begin your journey with us'}
            </p>
        </div>

        <div className="p-8">
            {!isLogin && (
                <div className="flex bg-gray-50 p-1 rounded-xl mb-6 border border-gray-100">
                    <button 
                        onClick={() => setRole('DINER')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'DINER' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400'}`}
                    >
                        Diner Account
                    </button>
                    <button 
                        onClick={() => setRole('CHEF')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${role === 'CHEF' ? 'bg-brand-dark text-brand-gold shadow-sm' : 'text-gray-400'}`}
                    >
                        Chef Partner
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                        <input 
                            type="text"
                            required 
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all text-sm"
                            placeholder="e.g. Julian Rossi"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                )}
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input 
                        type="email"
                        required 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all text-sm"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                    <input 
                        type="password"
                        required 
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-brand-gold transition-all text-sm"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-bold py-4 rounded-xl transition-all mt-4 flex items-center justify-center shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${role === 'CHEF' && !isLogin ? 'bg-brand-gold text-brand-dark' : 'bg-brand-dark text-white'}`}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        isLogin ? 'Sign In' : `Register as ${role === 'CHEF' ? 'Partner' : 'Member'}`
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400 font-medium">
                {isLogin ? "New to LuxePlate? " : "Already registered? "}
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-brand-dark font-bold hover:underline ml-1"
                >
                    {isLogin ? 'Create an account' : 'Sign in here'}
                </button>
            </div>

            {isLogin && onAdminAccess && (
                <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                    <button 
                        onClick={onAdminAccess}
                        className="text-[9px] font-bold text-gray-300 hover:text-brand-gold uppercase tracking-[0.3em] transition-colors"
                    >
                        Administrative Access
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
