import { supabase } from "../lib/supabase"; 
import { MapPin } from "lucide-react"; 
import Link from "next/link";
import PropertyFilter from "../components/PropertyFilter";

export const revalidate = 0;

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  // 1. Busca lista de cidades e bairros ÚNICOS para o filtro
  const { data: allProperties } = await supabase.from("properties").select("city, neighborhood");
  
  const uniqueCities = Array.from(new Set(allProperties?.map(p => p.city).filter(Boolean)));
  const uniqueNeighborhoods = Array.from(new Set(allProperties?.map(p => p.neighborhood).filter(Boolean)));

  // 2. Query Principal de Busca
  let query = supabase
    .from("properties")
    .select(`*, property_images (url, display_order)`)
    .eq("status", "disponivel");

  // --- CORREÇÃO AQUI: Adicionado "as string" para acalmar o TypeScript ---
  if (params.city) query = query.eq('city', params.city as string);
  if (params.neighborhood) query = query.eq('neighborhood', params.neighborhood as string);
  if (params.type) query = query.eq('type', params.type as string);
  if (params.category) query = query.eq('category', params.category as string);

  // Filtros de Valor
  if (params.minPrice) query = query.gte('price', Number(params.minPrice as string));
  if (params.maxPrice) query = query.lte('price', Number(params.maxPrice as string));

  // 3. Lógica de Ordenação
  const orderBy = (params.orderBy as string) || 'newest';

  switch (orderBy) {
    case 'oldest':
      query = query.order("created_at", { ascending: true });
      break;
    case 'price_asc': // Menor Valor
      query = query.order("price", { ascending: true });
      break;
    case 'price_desc': // Maior Valor
      query = query.order("price", { ascending: false });
      break;
    case 'title_asc': // A-Z
      query = query.order("title", { ascending: true });
      break;
    case 'title_desc': // Z-A
      query = query.order("title", { ascending: false });
      break;
    case 'newest': // Mais Recente (Padrão)
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Executa a busca
  const { data: properties } = await query;

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Mais Elegante */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-24 pb-32 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-light mb-4 tracking-tight">
            Imóveis exclusivos, <strong className="font-bold">selecionados para você.</strong>
          </h1>
          <p className="text-gray-400 text-base md:text-lg font-light">
            Encontre o lugar perfeito com a curadoria de Eduarda Fiuza.
          </p>
        </div>
      </div>

      {/* Filtro Completo */}
      <PropertyFilter 
        availableCities={uniqueCities as string[]} 
        availableNeighborhoods={uniqueNeighborhoods as string[]}
      />

      {/* Grid de Imóveis */}
      <div className="container mx-auto px-4 mt-16 max-w-7xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-8 pl-1 border-l-4 border-gray-900 flex justify-between items-end">
          <span>Destaques Recentes</span>
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {properties?.length} resultados
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties?.map((property) => {
            const coverImage = property.property_images?.[0]?.url;

            return (
              <Link key={property.id} href={`/imovel/${property.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col hover:-translate-y-1">
                  
                  {/* Foto */}
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {coverImage ? (
                      <img src={coverImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem foto</div>
                    )}
                    <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white px-2 py-1 rounded-sm ${property.type === 'venda' ? 'bg-black/70' : 'bg-blue-600/80'}`}>
                      {property.type}
                    </span>
                  </div>

                  {/* Informações */}
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                      {property.category?.replace('_', ' ') || 'Imóvel'}
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-700">
                      {property.title}
                    </h3>
                    <div className="mt-auto">
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}
                      </p>
                      <div className="flex items-center text-gray-500 text-xs pt-3 border-t border-gray-50">
                        <MapPin size={12} className="mr-1" />
                        <span className="truncate max-w-[150px]">{property.neighborhood}, {property.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}