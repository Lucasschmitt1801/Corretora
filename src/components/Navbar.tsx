"use client";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gray-900 text-white p-2 rounded-lg group-hover:bg-black transition-colors">
            <Building2 size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">
            EDUARDA<span className="font-light text-gray-500">FIUZA</span>
          </span>
        </Link>
        
        {/* Links removidos conforme solicitado */}
      </div>
    </header>
  );
}