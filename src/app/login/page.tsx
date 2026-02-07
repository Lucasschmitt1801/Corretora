"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Se deu certo, vai para o admin
      router.push("/admin/imoveis");
      router.refresh();
      
    } catch (err: any) {
      alert("Erro ao entrar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          {/* Ícone com a cor Primary */}
          <div className="bg-primary w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 rotate-3 hover:rotate-0 transition-all duration-500">
            <Lock className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Área Restrita</h1>
          <p className="text-gray-500 text-sm mt-1">Acesse o painel administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // Foco com cor Primary
              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            // Botão Verde Sálvia
            className="w-full bg-primary text-white font-bold py-3.5 rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Acessar Painel"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 font-medium">
            Sistema seguro • Acesso exclusivo para corretores
          </p>
        </div>
      </div>
    </main>
  );
}