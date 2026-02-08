"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Save, Tag } from "lucide-react";

export default function AdminCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");

  // Busca as categorias
  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories" as any).select("*").order("title");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Adicionar Categoria
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    // Cria um slug simples (ex: "Chácara Linda" -> "chacara_linda")
    const slug = newCategory
      .toLowerCase()
      .trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/\s+/g, "_"); // troca espaço por underline

    const { error } = await supabase
      .from("categories" as any)
      .insert([{ title: newCategory, slug }]);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      setNewCategory("");
      fetchCategories();
    }
  };

  // Excluir Categoria
  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Tem certeza? Imóveis com essa categoria podem ficar sem classificação.");
    if (!confirm) return;
    
    const { error } = await supabase.from("categories" as any).delete().eq("id", id);
    if (error) alert("Erro ao excluir: " + error.message);
    else fetchCategories();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h1>
            <p className="text-sm text-gray-500">Crie opções para os filtros do site.</p>
          </div>
          <button onClick={() => router.back()} className="text-gray-500 hover:text-primary flex items-center text-sm font-medium transition-colors">
            <ArrowLeft size={16} className="mr-1"/> Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Formulário de Criação */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-primary" /> Nova Categoria
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome da Categoria</label>
                <input 
                  type="text" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Ex: Cobertura, Chácara..." 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <button 
                type="submit" 
                disabled={!newCategory}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <Save size={18} /> Salvar
              </button>
            </form>
          </div>

          {/* Lista de Categorias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <Tag size={18} /> Categorias Ativas ({categories.length})
              </h2>
            </div>
            
            {loading ? (
              <p className="p-6 text-center text-gray-400">Carregando...</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <li key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                    <div>
                      <span className="font-medium text-gray-900 block">{cat.title}</span>
                      <span className="text-xs text-gray-400 font-mono">slug: {cat.slug}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}