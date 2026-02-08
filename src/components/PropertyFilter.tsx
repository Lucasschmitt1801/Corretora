"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Search, X, ArrowUpDown } from "lucide-react";

interface FilterProps {
  availableCities: string[];
  allLocations: { city: string; neighborhood: string }[];
  // NOVA PROPRIEDADE: Recebe as categorias do banco
  categories?: { title: string; slug: string }[]; 
}

export default function PropertyFilter({ availableCities, allLocations, categories = [] }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("neighborhood") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "newest");

  const urlCity = searchParams.get("city");

  useEffect(() => {
     if (city !== urlCity) {
        setNeighborhood("");
     }
  }, [city, urlCity]);

  const filteredNeighborhoods = useMemo(() => {
    let data = allLocations;
    if (city) {
      data = data.filter(item => item.city === city);
    }
    const uniqueNeighborhoods = Array.from(new Set(data.map(item => item.neighborhood))).sort();
    return uniqueNeighborhoods;
  }, [city, allLocations]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (neighborhood) params.set("neighborhood", neighborhood);
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (orderBy) params.set("orderBy", orderBy);
    
    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setCity(""); setNeighborhood(""); setType(""); setCategory("");
    setMinPrice(""); setMaxPrice(""); setOrderBy("newest");
    router.push("/");
  };

  // ESTILOS ATUALIZADOS PARA USAR O VERDE SÁLVIA (PRIMARY)
  const selectClass = "w-full p-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none";
  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none";
  const labelClass = "block mb-1 text-xs font-bold text-gray-500 uppercase tracking-wider";

  return (
    <div className="w-full max-w-6xl mx-auto -mt-20 relative z-30 px-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 lg:p-8">
        
        {/* GRID DE FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          
          <div>
            <label className={labelClass}>Cidade</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
              <option value="">Todas as cidades</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Bairro</label>
            <select 
              value={neighborhood} 
              onChange={(e) => setNeighborhood(e.target.value)} 
              className={`${selectClass} ${filteredNeighborhoods.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={filteredNeighborhoods.length === 0}
            >
              <option value="">{city ? `Bairros de ${city}` : "Todos os bairros"}</option>
              {filteredNeighborhoods.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Tipo de Imóvel</label>
            {/* AQUI ESTÁ A MUDANÇA: Usamos categories.map */}
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value="">Todos os tipos</option>
              
              {/* Se tiver categorias do banco, usa elas */}
              {categories.length > 0 ? (
                 categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.title}</option>
                 ))
              ) : (
                 // Fallback (caso o banco falhe ou esteja vazio no inicio)
                 <>
                   <option value="casa">Casa</option>
                   <option value="apartamento">Apartamento</option>
                   <option value="terreno">Terreno</option>
                 </>
              )}
            </select>
          </div>

          <div>
             <label className={labelClass}>Ordenar Por</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"><ArrowUpDown size={14} /></div>
                <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)} className={`${selectClass} pl-9`}>
                   <option value="newest">Mais Recentes</option>
                   <option value="oldest">Mais Antigos</option>
                   <option value="price_asc">Menor Valor</option>
                   <option value="price_desc">Maior Valor</option>
                   <option value="title_asc">Nome (A-Z)</option>
                   <option value="title_desc">Nome (Z-A)</option>
                </select>
             </div>
          </div>

        </div>
        
        {/* LINHA DE VALORES E BOTÕES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
           
           <div>
            <label className={labelClass}>Valor Mínimo</label>
            <input type="number" placeholder="R$ 0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputClass} />
           </div>

           <div>
            <label className={labelClass}>Valor Máximo</label>
            <input type="number" placeholder="R$ Ilimitado" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputClass} />
           </div>

           {/* ESPAÇO VAZIO E BOTÕES */}
           <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 justify-end h-full">
               <button onClick={handleClear} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1 border border-transparent hover:border-red-100 h-[42px] mt-auto">
                 <X size={16} /> Limpar
               </button>
               
               <button onClick={handleSearch} className="bg-primary text-white font-bold px-8 py-2.5 rounded-lg hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 h-[42px] mt-auto w-full sm:w-auto">
                 <Search size={18} /> Buscar Imóveis
               </button>
           </div>

        </div>

      </div>
    </div>
  );
}