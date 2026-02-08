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

  // 1. Busca lista de locais (Cidade + Bairro)
  const { data: allLocationsData } = await supabase
    .from("properties")
    .select("city, neighborhood")
    .not("city", "is", null)
    .not("neighborhood", "is", null);

  const uniqueCities = Array.from(new Set(allLocationsData?.map(p => p.city).filter(Boolean))).sort();
  
  const allLocations = allLocationsData
    ?.filter(p => p.city && p.neighborhood)
    .map(p => ({ city: p.city as string, neighborhood: p.neighborhood as string })) || [];

  // 2. NOVA BUSCA: Categorias do Banco de Dados
  // Buscamos apenas o título e o slug (ex: "Sala Comercial", "sala_comercial")
  const { data: categoriesData } = await supabase
    .from("categories" as any) // 'as any' para evitar erro de tipagem se a tabela for nova
    .select("title, slug")
    .order("title");

  // 3. Query Principal de Busca
  let query = supabase
    .from("properties")
    .select(`*, property_images (url, display_order)`)
    .eq("status", "disponivel");

  if (params.city) query = query.eq('city', params.city as string);
  if (params.neighborhood) query = query.eq('neighborhood', params.neighborhood as string);
  if (params.type) query = query.eq('type', params.type as string);
  
  // O filtro de categoria agora usa o slug que vem da URL
  if (params.category) query = query.eq('category', params.category as string);
  
  if (params.minPrice) query = query.gte('price', Number(params.minPrice as string));
  if (params.maxPrice) query = query.lte('price', Number(params.maxPrice as string));

  const orderBy = (params.orderBy as string) || 'newest';

  switch (orderBy) {
    case 'oldest': query = query.order("created_at", { ascending: true }); break;
    case 'price_asc': query = query.order("price", { ascending: true }); break;
    case 'price_desc': query = query.order("price", { ascending: false }); break;
    case 'title_asc': query = query.order("title", { ascending: true }); break;
    case 'title_desc': query = query.order("title", { ascending: false }); break;
    case 'newest': default: query = query.order("created_at", { ascending: false }); break;
  }

  const { data: properties } = await query;

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white pt-24 pb-32 px-4 shadow-md">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-light mb-4 tracking-tight">
            Seu novo endereço <strong className="font-bold">começa aqui.</strong>
          </h1>
          <p className="text-white/80 text-base md:text-lg font-light">
            Experiência, critério e transparência em cada escolha.
          </p>
        </div>
      </div>

      {/* PASSAMOS AS CATEGORIAS PARA O FILTRO AQUI */}
      <PropertyFilter 
        availableCities={uniqueCities as string[]} 
        allLocations={allLocations}
        categories={(categoriesData as any) || []} 
      />

      <div className="container mx-auto px-4 mt-16 max-w-7xl">
        
        <h2 className="text-xl font-semibold text-gray-800 mb-8 pl-1 border-l-4 border-primary flex justify-between items-end">
          <span>Destaques Recentes</span>
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {properties?.length || 0} resultados
          </span>
        </h2>

        {(!properties || properties.length === 0) ? (
            <div className="text-center py-20 text-gray-400">
                <p className="mb-2">Nenhum imóvel encontrado com esses filtros.</p>
                <Link href="/" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                   Limpar filtros
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties?.map((property) => {
                const coverImage = property.property_images?.[0]?.url;

                return (
                <Link key={property.id} href={`/imovel/${property.id}`} className="group block h-full">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col hover:-translate-y-1">
                    
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                        {coverImage ? (
                        <img src={coverImage} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem foto</div>
                        )}
                        
                        <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white px-2 py-1 rounded-sm ${property.type === 'venda' ? 'bg-gray-900/90' : 'bg-primary/90'}`}>
                          {property.type}
                        </span>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                          {property.category?.replace('_', ' ') || 'Imóvel'}
                        </div>
                        
                        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary">
                          {property.title}
                        </h3>

                        <div className="mt-auto">
                            <div className="text-lg font-bold text-gray-900 mb-2">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}
                            </div>
                            
                            <div className="flex items-center text-gray-500 text-xs pt-3 border-t border-gray-50">
                                <MapPin size={12} className="mr-1 flex-shrink-0" />
                                <span className="truncate max-w-[150px]">{property.neighborhood}, {property.city}</span>
                            </div>
                        </div>
                    </div>
                    </div>
                </Link>
                );
            })}
            </div>
        )}
      </div>
    </main>
  );
}