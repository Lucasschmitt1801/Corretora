import { supabase } from "../../../../lib/supabase"; // Ou o caminho relativo que funcionou (../../lib/supabase)
import { MapPin, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Força a página a ser dinâmica (sempre busca dados novos)
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetails({ params }: PageProps) {
  // 1. Pega o ID da URL (No Next 15+ params é uma Promise)
  const { id } = await params;

  // 2. Busca o imóvel no banco
  const { data: property, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !property) {
    notFound(); // Mostra página 404 se não achar
  }

  // 3. Formata o link do WhatsApp
  // Substitua pelo número da corretora
  const PHONE_NUMBER = "5551999999999"; 
  const message = `Olá, gostaria de saber mais sobre o imóvel *${property.code}* (${property.title}) que vi no site.`;
  const whatsappLink = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;

  // 4. Link do Google Maps
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${property.address || ""} ${property.neighborhood}, ${property.city}`
  )}`;

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      
      {/* Botão Voltar */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Voltar para Vitrine
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA DA ESQUERDA: Fotos e Detalhes */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Foto Principal (Placeholder por enquanto) */}
            <div className="bg-gray-200 rounded-xl h-[400px] flex items-center justify-center text-gray-500 shadow-sm">
              <span className="text-lg font-medium">Foto Principal do Imóvel</span>
            </div>

            {/* Título e Endereço */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-500">
                    <MapPin size={18} className="mr-1" />
                    {property.neighborhood}, {property.city}
                  </div>
                </div>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold uppercase">
                  {property.type}
                </span>
              </div>
              
              <hr className="my-6 border-gray-100" />
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre o imóvel</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* COLUNA DA DIREITA: Card de Contato (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
              <p className="text-sm text-gray-500 mb-1">Valor do Investimento</p>
              <p className="text-3xl font-bold text-gray-900 mb-6">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(property.price)}
              </p>

              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-1"
                >
                  <Phone size={20} className="mr-2" />
                  Chamar no WhatsApp
                </a>

                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <MapPin size={20} className="mr-2" />
                  Ver Localização no Mapa
                </a>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-blue-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Agende sua visita</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Acompanhamento exclusivo com Eduarda Fiuza.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-gray-400">
                Cód: {property.code}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}