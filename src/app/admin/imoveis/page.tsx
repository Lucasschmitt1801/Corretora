"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Trash2, Edit, Plus, ExternalLink, LogOut, 
  Search, Building2, CheckCircle2, DollarSign, RotateCcw
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

  // --- AÇÃO: FECHAR NEGÓCIO (VENDER/ALUGAR) ---
  const handleMarkAsSold = async (id: string, title: string, type: string, currentStatus: string) => {
    // Lógica inteligente: Se é Venda -> Vendido. Se é Aluguel -> Alugado.
    // Se já está vendido/alugado, permite voltar para Disponível (caso tenha clicado errado).
    
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

      // Atualiza a lista localmente para refletir a mudança na hora
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
  
  // SOMA DOS NEGÓCIOS FECHADOS (Status NÃO disponível)
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

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Sair
            </button>
            <Link
              href="/admin/imoveis/novo"
              className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} /> Novo Imóvel
            </Link>
          </div>
        </div>

        {/* CARDS DE ESTATÍSTICAS (KPIs) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Ativo */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Imóveis na Vitrine</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalActive} <span className="text-sm text-gray-400 font-normal">/ {totalProperties}</span></h3>
            </div>
          </div>

          {/* Card 2: Valor em Negócios Fechados (NOVO) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Negócios Fechados</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }).format(closedDealsValue)}
              </h3>
              <p className="text-xs text-green-600 font-medium mt-1">{closedDealsCount} imóveis vendidos/alugados</p>
            </div>
          </div>

          {/* Card 3 (Manteve igual ou mudou se quiser) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 opacity-70">
            {/* Espaço livre para futuro KPI */}
            <div className="p-3 bg-gray-100 text-gray-400 rounded-xl">
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
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">Carregando seus imóveis...</div>
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
                      <tr key={prop.id} className={`transition-colors group ${isSoldOrRented ? 'bg-gray-50 opacity-70' : 'hover:bg-gray-50/80'}`}>
                        {/* Foto Thumbnail */}
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden border border-gray-200 grayscale-0 group-hover:grayscale-0 transition-all">
                            {thumb ? (
                              <img src={thumb} className={`w-full h-full object-cover ${isSoldOrRented ? 'grayscale' : ''}`} alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Sem foto</div>
                            )}
                          </div>
                        </td>

                        {/* Título e Código */}
                        <td className="px-6 py-4">
                          <div className={`font-bold ${isSoldOrRented ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'}`}>
                            {prop.title}
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">Ref: {prop.code}</div>
                        </td>

                        {/* Preço */}
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            maximumFractionDigits: 0
                          }).format(prop.price)}
                        </td>

                        {/* Status (Badge) */}
                        <td className="px-6 py-4 text-center">
                          {isSoldOrRented ? (
                             <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600">
                               {prop.status}
                             </span>
                          ) : (
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              prop.type === 'venda' 
                                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                : 'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                              Disponível
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            
                            {/* BOTÃO DE FECHAR NEGÓCIO (NOVO) */}
                            <button
                              onClick={() => handleMarkAsSold(prop.id, prop.title, prop.type, prop.status)}
                              className={`p-2 rounded-lg transition-all ${
                                isSoldOrRented 
                                  ? 'text-orange-400 hover:text-orange-700 hover:bg-orange-50' // Botão de desfazer
                                  : 'text-green-600 hover:text-green-800 hover:bg-green-50' // Botão de concluir
                              }`}
                              title={isSoldOrRented ? "Tornar disponível novamente" : "Marcar como Vendido/Alugado"}
                            >
                              {isSoldOrRented ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
                            </button>

                            {/* Editar */}
                            <Link
                              href={`/admin/imoveis/editar/${prop.id}`}
                              className="p-2 text-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </Link>

                            {/* Excluir */}
                            <button
                              onClick={() => handleDelete(prop.id, prop.title)}
                              className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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