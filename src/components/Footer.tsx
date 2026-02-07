import Link from "next/link";
import { Lock } from "lucide-react";

export default function Footer() {
  return (
    // ALTERAÇÃO: Troquei bg-gray-900 (azulado) por bg-primary-dark (seu verde escuro)
    // Se achar que ficou muito claro, troque 'bg-primary-dark' por 'bg-[#2A332A]' (um verde quase preto)
    <footer className="bg-primary-dark text-white/80 py-10 mt-auto border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Direitos Autorais */}
        <div className="text-center md:text-left">
          {/* Nome da marca em destaque */}
          <p className="font-bold text-white tracking-wider text-lg">EDUARDA FIUZA</p>
          <p className="text-xs mt-1 font-light opacity-80">
            © {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>

        {/* Link Discreto para Admin */}
        <Link 
          href="/admin/imoveis" 
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-colors py-2 px-4 rounded hover:bg-white/10"
        >
          <Lock size={12} />
          Acesso administrador
        </Link>

      </div>
    </footer>
  );
}