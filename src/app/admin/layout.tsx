"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function checkUser() {
      // Pergunta pro Supabase: "Tem alguém logado?"
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Se não tiver, manda pro login
        router.push("/login");
      } else {
        // Se tiver, libera o acesso
        setAuthorized(true);
      }
    }

    checkUser();
  }, [router]);

  // Enquanto verifica, mostra um loading simples (evita piscar a tela proibida)
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 font-medium animate-pulse">Verificando credenciais...</p>
      </div>
    );
  }

  // Se autorizado, mostra o conteúdo da página admin
  return <>{children}</>;
}