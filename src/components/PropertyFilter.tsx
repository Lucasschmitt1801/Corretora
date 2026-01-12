"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X, ArrowUpDown } from "lucide-react";

interface FilterProps {
  availableCities: string[];
  availableNeighborhoods: string[];
}

export default function PropertyFilter({ availableCities, availableNeighborhoods }: FilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados dos filtros
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [neighborhood, setNeighborhood] = useState(searchParams.get("neighborhood") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [orderBy, setOrderBy] = useState(searchParams.get("orderBy") || "newest"); // Padrão: Mais recente

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

  const selectClass = "w-full p-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all";
  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all";
  const labelClass = "block mb-1 text-xs font-bold text-gray-500 uppercase tracking-wider";

  return (
    <div className="w-full max-w-6xl mx-auto -mt-20 relative z-30 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* --- LINHA 1: Localização e Tipo --- */}
          
          {/* Cidade */}
          <div>
            <label className={labelClass}>Cidade</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
              <option value="">Todas as cidades</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Bairro */}
          <div>
            <label className={labelClass}>Bairro</label>
            <select value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={selectClass}>
              <option value="">Todos os bairros</option>
              {availableNeighborhoods.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* Negócio */}
          <div>
            <label className={labelClass}>Negócio</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
              <option value="">Comprar ou Alugar</option>
              <option value="venda">Comprar</option>
              <option value="aluguel">Alugar</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className={labelClass}>Imóvel</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              <option value="">Todos os tipos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="sala_comercial">Comercial</option>
            </select>
          </div>

          {/* --- LINHA 2: Preços e Ordenação --- */}

          {/* Preço Mínimo */}
          <div>
            <label className={labelClass}>Valor Mínimo</label>
            <input 
              type="number" 
              placeholder="R$ 0" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)} 
              className={inputClass}
            />
          </div>

          {/* Preço Máximo */}
          <div>
            <label className={labelClass}>Valor Máximo</label>
            <input 
              type="number" 
              placeholder="R$ Ilimitado" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)} 
              className={inputClass}
            />
          </div>

          {/* Ordenação */}
          <div className="lg:col-span-2">
             <label className={labelClass}>Ordenar Por</label>
             <div className="flex gap-2">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <ArrowUpDown size={16} />
                  </div>
                  <select 
                    value={orderBy} 
                    onChange={(e) => setOrderBy(e.target.value)} 
                    className={`${selectClass} pl-10`}
                  >
                    <option value="newest">Mais Recentes</option>
                    <option value="oldest">Mais Antigos</option>
                    <option value="price_asc">Menor Valor</option>
                    <option value="price_desc">Maior Valor</option>
                    <option value="title_asc">Nome (A-Z)</option>
                    <option value="title_desc">Nome (Z-A)</option>
                  </select>
                </div>
                
                {/* Botão Buscar (Mobile fica embaixo, Desktop fica ao lado) */}
                 <button onClick={handleSearch} className="bg-gray-900 text-white font-bold px-6 rounded-lg hover:bg-black transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
                  <Search size={18} /> <span className="hidden md:inline">Buscar</span>
                </button>
             </div>
          </div>

        </div>

        {/* Botão Limpar Filtros (Pequeno) */}
        <div className="mt-4 flex justify-end">
          <button onClick={handleClear} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1">
             <X size={12} /> Limpar todos os filtros
          </button>
        </div>
      </div>
    </div>
  );
}