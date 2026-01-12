"use client"; // Necessário porque tem interatividade (abrir/fechar menu mobile)

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO (Texto estilizado por enquanto) */}
        <Link href="/" className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            EDUARDA FIUZA
          </span>
          <span className="text-xs tracking-[0.2em] text-gray-500 uppercase">
            Corretora de Imóveis
          </span>
        </Link>

        {/* BOTÃO DE CONTATO (CTA) */}
        <div className="hidden md:block">
          <a
            href="https://wa.me/55NUMEROSEUCLIENTE" // Vamos configurar isso dinamicamente depois
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Phone size={16} />
            Fale Comigo
          </a>
        </div>

        {/* BOTÃO MOBILE (Hamburger) */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={toggleMenu}
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MENU MOBILE (Expandido) */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0">
          <nav className="flex flex-col p-4 gap-4">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-medium text-gray-700 py-2 border-b border-gray-50"
            >
              Início
            </Link>
            <Link 
              href="/imoveis" 
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-medium text-gray-700 py-2 border-b border-gray-50"
            >
              Imóveis
            </Link>
            <Link 
              href="/sobre" 
              onClick={() => setIsMenuOpen(false)}
              className="text-base font-medium text-gray-700 py-2 border-b border-gray-50"
            >
              Sobre Mim
            </Link>
            <a
              href="https://wa.me/55NUMEROSEUCLIENTE"
              className="mt-2 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-medium"
            >
              <Phone size={18} />
              Chamar no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}