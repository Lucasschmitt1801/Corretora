"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Trash2, Edit, Plus, LogOut, 
  Search, Building2, CheckCircle2, DollarSign, RotateCcw, Tag
} from "lucide-react";

export default function AdminPropertiesList() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select(`*, property_images (url)`)
      .order("created_at", { ascending: false });

    if (error) console.error("Erro ao buscar:", error);
    else setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- AÇÃO: FECHAR NEGÓCIO ---
  const handleMarkAsSold = async (id: string, title: string, type: string, currentStatus: string) => {
    const isAvailable = currentStatus === 'disponivel';
    const newStatus = isAvailable 
      ? (type === 'venda' ? 'vendido' : 'alugado') 
      : 'disponivel';

    const actionName = isAvailable ? "fechar negócio do" : "disponibilizar novamente o";
    
    const confirm = window.confirm(`Deseja ${actionName} imóvel "${title}"?`);
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setProperties((prev) => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));

    } catch (err: any) {
      alert("Erro ao atualizar status: " + err.message);
    }
  };

  // --- AÇÃO: EXCLUIR ---
  const handleDelete = async (id: string, title: string) => {
    const confirm = window.confirm(`Tem certeza que deseja excluir "${title}"?`);
    if (!confirm) return;

    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  // --- CÁLCULOS DO DASHBOARD (KPIS) ---
  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProperties = properties.length;
  const totalActive = properties.filter(p => p.status === 'disponivel').length;
  
  const closedDealsValue = properties
    .filter(p => p.status !== 'disponivel')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const closedDealsCount = properties.filter(p => p.status !== 'disponivel').length;

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Painel Administrativo</h1>
            <p className="text-sm text-gray-500">Gerencie seu portfólio imobiliário</p>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            
            {/* Botão Sair */}
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-red-500 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
            >
              <LogOut size={16} /> Sair
            </button>

            {/* --- NOVO BOTÃO: GERENCIAR CATEGORIAS --- */}
            <Link
              href="/admin/categorias"
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-primary/30 hover:text-primary rounded-lg transition-all flex items-center gap-2"
            >
               <Tag size={16} /> Categorias
            </Link>

            {/* Botão Novo Imóvel */}
            <Link
              href="/admin/imoveis/novo"
              className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl shadow-primary/20"
            >
              <Plus size={18} /> Novo Imóvel
            </Link>
          </div>
        </div>

        {/* CARDS DE ESTATÍSTICAS (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Imóveis na Vitrine (Ativos) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Imóveis na Vitrine</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalActive} <span className="text-sm text-gray-400 font-normal">/ {totalProperties}</span></h3>
            </div>
          </div>

          {/* Card 2: Negócios Fechados */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1 bg-primary-dark"></div>
            <div className="p-3 bg-gray-50 text-primary-dark rounded-xl group-hover:bg-primary-dark group-hover:text-white transition-all">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Negócios Fechados</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(closedDealsValue)}
              </h3>
              <p className="text-xs text-primary-dark font-medium mt-1">{closedDealsCount} vendidos/alugados</p>
            </div>
          </div>

          {/* Card 3: Total Geral */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 opacity-80">
            <div className="p-3 bg-gray-100 text-gray-500 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Cadastrado</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalProperties}</h3>
            </div>
          </div>
        </div>

        {/* ÁREA DA TABELA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Barra de Busca */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Buscar por título ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="p-12 text-center text-primary font-medium animate-pulse">Carregando seus imóveis...</div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Nenhum imóvel encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 w-20">Foto</th>
                    <th className="px-6 py-4">Imóvel</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProperties.map((prop) => {
                    const thumb = prop.property_images?.[0]?.url;
                    const isSoldOrRented = prop.status === 'vendido' || prop.status === 'alugado';
                    
                    return (
                      <tr key={prop.id} className={`transition-colors group ${isSoldOrRented ? 'bg-gray-50/80 opacity-60' : 'hover:bg-primary/5'}`}>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                            {thumb ? (
                              <img src={thumb} className={`w-full h-full object-cover ${isSoldOrRented ? 'grayscale' : ''}`} alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">Sem foto</div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className={`font-bold ${isSoldOrRented ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'}`}>
                            {prop.title}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">Ref: {prop.code}</div>
                        </td>

                        <td className="px-6 py-4 font-bold text-gray-700">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0
                          }).format(prop.price)}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {isSoldOrRented ? (
                             <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-500 border border-gray-300">
                               {prop.status}
                             </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                              Disponível
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {/* Botão Check / Rotate */}
                            <button
                              onClick={() => handleMarkAsSold(prop.id, prop.title, prop.type, prop.status)}
                              className={`p-2 rounded-lg transition-all ${
                                isSoldOrRented 
                                  ? 'text-gray-400 hover:text-primary hover:bg-primary/10' 
                                  : 'text-primary-dark/70 hover:text-primary-dark hover:bg-primary/10'
                              }`}
                              title={isSoldOrRented ? "Tornar disponível novamente" : "Marcar como Vendido/Alugado"}
                            >
                              {isSoldOrRented ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
                            </button>

                            {/* Botão Editar */}
                            <Link
                              href={`/admin/imoveis/editar/${prop.id}`}
                              className="p-2 text-primary/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Link>

                            {/* Botão Excluir */}
                            <button
                              onClick={() => handleDelete(prop.id, prop.title)}
                              className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}