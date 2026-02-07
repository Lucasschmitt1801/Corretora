import { supabase } from "../../../lib/supabase"; 
import { MapPin, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers"; 
import ImageGallery from "../../../components/ImageGallery"; 

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetails({ params }: PageProps) {
  const { id } = await params;

  // 1. Busca Imóvel + Fotos
  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (
        url,
        display_order
      )
    `)
    .eq("id", id)
    .single();

  if (error || !property) {
    return notFound(); 
  }

  // 2. Lógica para gerar o Link da Página (para o WhatsApp)
  const headersList = await headers();
  const host = headersList.get("host"); 
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const propertyUrl = `${protocol}://${host}/imovel/${id}`;

  // 3. Prepara dados de Contato
  const PHONE_NUMBER = "5551981536500"; 
  
  const message = `Olá! Vi este imóvel no site e gostaria de mais informações: ${propertyUrl}`;
  const whatsappLink = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;

  const fullAddress = `${property.address || ""}, ${property.neighborhood}, ${property.city}`;
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <main className="min-h-screen bg-white pb-12">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" />
          Voltar para Vitrine
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ESQUERDA: Galeria e Descrição */}
          <div className="lg:col-span-2 space-y-8">
            
            <ImageGallery 
              images={property.property_images || []} 
              title={property.title} 
            />

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{property.title}</h1>
                  <div className="flex items-center text-gray-500">
                    <MapPin size={18} className="mr-1 text-primary" />
                    {property.neighborhood}, {property.city}
                  </div>
                </div>
                {/* Etiqueta com cor da marca */}
                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                  {property.type}
                </span>
              </div>
              
              <hr className="my-8 border-gray-100" />
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre o imóvel</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                {property.description}
              </p>
            </div>
          </div>

          {/* DIREITA: Card de Contato */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
              <p className="text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">Valor do Investimento</p>
              
              {/* Valor Principal */}
              <p className="text-4xl font-bold text-gray-900 tracking-tight">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0
                }).format(property.price)}
              </p>

              {/* Condomínio */}
              {(property as any).condo_price > 0 ? (
                <p className="text-sm text-gray-500 mt-2 mb-8 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  Condomínio: <strong className="text-gray-700">{new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format((property as any).condo_price)}</strong>
                </p>
              ) : (
                <div className="mb-8"></div>
              )}

              
              <div className="space-y-4">
                {/* Botão WhatsApp com a cor da Marca (Sálvia) */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:-translate-y-1"
                >
                  <Phone size={20} className="mr-2" />
                  Chamar no WhatsApp
                </a>

                {/* Botão Mapa */}
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-white text-gray-600 border border-gray-200 py-3 rounded-xl font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  <MapPin size={20} className="mr-2" />
                  Ver localização no Mapa
                </a>
              </div>

              {/* Caixa de Benefício - Ajustada para Cinza/Verde */}
              <div className="mt-8 p-5 bg-gray-50 rounded-xl flex items-start gap-4 border border-primary/20">
                <CheckCircle2 className="text-primary mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-gray-900">Agende sua visita</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Tenha um acompanhamento exclusivo e tire todas as suas dúvidas com a gente.
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-gray-300 font-mono">
                REF: {property.code}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}