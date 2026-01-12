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
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="bg-gray-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gray-300">
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
              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400"
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
              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-lg hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? "Entrando..." : "Acessar Painel"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Acesso exclusivo para corretores autorizados.
          </p>
        </div>
      </div>
    </main>
  );
}