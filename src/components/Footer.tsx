import Link from "next/link";
import { Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Direitos Autorais */}
        <div className="text-center md:text-left">
          <p className="font-bold text-white">EDUARDA FIUZA</p>
          <p className="text-sm mt-1">© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>

        {/* Link Discreto para Admin */}
        <Link 
          href="/admin/imoveis" 
          className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-300 transition-colors py-2 px-4 rounded hover:bg-gray-800"
        >
          <Lock size={12} />
          Acesso administrador
        </Link>

      </div>
    </footer>
  );
}