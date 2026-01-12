import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // Certifique-se que o Navbar.tsx existe nessa pasta
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eduarda Fiuza | Corretora de Imóveis",
  description: "Imóveis selecionados com exclusividade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* Menu Superior Fixo */}
        <Navbar />
        
        {/* Conteúdo da Página (Cresce para empurrar o rodapé) */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Rodapé Fixo no final */}
        <Footer />
      </body>
    </html>
  );
}