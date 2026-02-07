
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Loader2, Mail, Lock, ArrowRight, UserPlus, LogIn, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setShowSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-green-500" size={48} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-4">
            Quase lá!
          </h1>
          <p className="text-gray-400 text-lg font-medium mb-10">
            Enviamos um link de confirmação para <span className="text-white font-bold">{email}</span>. <br/>
            <span className="text-amber-400">Verifique seu e-mail</span> para ativar sua conta.
          </p>
          
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl mb-10 text-sm text-gray-500">
            Não recebeu? Verifique sua caixa de spam ou aguarde alguns minutos.
          </div>

          <button 
            onClick={() => {
              setShowSuccess(false);
              setIsSignUp(false);
            }}
            className="w-full bg-white text-black p-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
          >
            <LogIn size={20} />
            <span>Ir para o Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-400/20">
            <span className="text-black font-black text-3xl">M</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            {isSignUp ? 'Criar sua Conta' : 'Acesse seu Painel'}
          </h1>
          <p className="text-gray-500 font-medium">
            {isSignUp ? 'Comece a gerenciar seu restaurante hoje.' : 'Gerencie seu cardápio e receba pedidos.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="bg-gray-900 border border-gray-800 p-8 rounded-[40px] shadow-2xl space-y-4">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center text-red-400 text-sm font-bold">
              <AlertCircle size={18} className="mr-2 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="email" 
                required 
                className="w-full p-4 pl-12 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-amber-400 transition-all font-bold"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="password" 
                required 
                className="w-full p-4 pl-12 bg-black border border-gray-800 rounded-2xl text-white outline-none focus:border-amber-400 transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-400 text-black p-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 hover:bg-amber-300 transition-all active:scale-95 shadow-xl shadow-amber-400/10 mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <span>{isSignUp ? 'Cadastrar Agora' : 'Entrar no Painel'}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-400 hover:text-white font-bold transition-colors flex items-center justify-center mx-auto space-x-2"
          >
            {isSignUp ? (
              <>
                <LogIn size={18} />
                <span>Já tem conta? Entrar</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Não tem conta? Criar agora</span>
              </>
            )}
          </button>
          
          <button 
            onClick={onBack}
            className="flex items-center justify-center mx-auto space-x-2 text-gray-600 hover:text-gray-400 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Voltar para a página inicial</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
