"use client";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          
          {/* Ícone Verde */}
          <div className="bg-primary text-white p-2 rounded-lg group-hover:bg-primary-dark transition-colors shadow-md shadow-primary/20">
            <Building2 size={20} />
          </div>

          {/* Texto Verde Sálvia */}
          <span className="font-bold text-xl tracking-tight text-primary group-hover:text-primary-dark transition-colors">
            EDUARDA<span className="font-light text-primary/70">FIUZA</span>
          </span>
          
        </Link>
        
        {/* Links removidos conforme solicitado */}
      </div>
    </header>
  );
}