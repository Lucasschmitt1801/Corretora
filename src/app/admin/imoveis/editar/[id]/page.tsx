"use client";

import { useEffect, useState } from "react"; 
import { useForm } from "react-hook-form";
import { supabase } from "../../../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image as ImageIcon } from "lucide-react";

// Importe o componente que criamos
import AutocompleteInput from "../../../../../components/AutocompleteInput";

type PropertyFormData = {
  code: string; title: string; description: string; price: number; condo_price: number;
  city: string; neighborhood: string; address: string; category: string;
};

type PropertyImage = {
  id: string;
  url: string;
};

export default function EditPropertyPage() {
  const params = useParams(); 
  const id = params?.id as string; 
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<PropertyFormData>();
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentImages, setCurrentImages] = useState<PropertyImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // Estados Dinâmicos
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);
  const [suggestedNeighborhoods, setSuggestedNeighborhoods] = useState<string[]>([]);

  const currentCity = watch("city");
  const currentNeighborhood = watch("neighborhood");

  useEffect(() => {
    async function loadData() {
      if (!id) return;

      // 1. Busca Imóvel
      const { data: property, error } = await supabase
        .from("properties")
        .select(`*, property_images (id, url, display_order)`)
        .eq("id", id)
        .single();

      // 2. Busca Categorias (NOVO)
      const { data: catData } = await supabase
        .from("categories" as any)
        .select("*")
        .order("title");
      if (catData) setCategories(catData);

      // 3. Busca Sugestões de Localização
      const { data: allProps } = await supabase.from("properties").select("city, neighborhood");
      if (allProps) {
        setSuggestedCities(Array.from(new Set(allProps.map(p => p.city?.trim()).filter(Boolean))).sort());
        setSuggestedNeighborhoods(Array.from(new Set(allProps.map(p => p.neighborhood?.trim()).filter(Boolean))).sort());
      }

      if (error) {
        console.error("Erro Supabase:", error);
        alert("Erro ao carregar imóvel.");
        router.push("/admin/imoveis");
      } else {
        const { property_images, ...textData } = property as any;

        reset({
          code: textData.code || "",
          title: textData.title || "",
          description: textData.description || "",
          price: textData.price || 0,
          condo_price: textData.condo_price || 0,
          city: textData.city || "",
          neighborhood: textData.neighborhood || "",
          address: textData.address || "",
          category: textData.category || "" // Se a categoria antiga não existir, fica vazio
        });
        
        setCurrentImages(property_images || []);
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, reset, router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);
      const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...previewUrls]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: string) => {
    const confirm = window.confirm("Tem certeza que deseja excluir esta foto?");
    if (!confirm) return;
    try {
      const { error } = await supabase.from("property_images").delete().eq("id", imageId);
      if (error) throw error;
      setCurrentImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      alert("Erro ao excluir imagem: " + err.message);
    }
  };

  async function onUpdate(data: PropertyFormData) {
    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          code: data.code,
          title: data.title,
          description: data.description,
          price: data.price,
          condo_price: data.condo_price,
          city: data.city.trim(),
          neighborhood: data.neighborhood.trim(),
          address: data.address,
          type: 'venda', 
          category: data.category
        })
        .eq("id", id);

      if (updateError) throw updateError;

      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file, index) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${id}/${Date.now()}_new_${index}.${fileExt}`;
          await supabase.storage.from("imoveis").upload(fileName, file);
          const { data: publicUrlData } = supabase.storage.from("imoveis").getPublicUrl(fileName);
          return { property_id: id, url: publicUrlData.publicUrl, display_order: 99 };
        });
        const imagesToInsert = await Promise.all(uploadPromises);
        await supabase.from("property_images").insert(imagesToInsert);
      }

      alert("Imóvel atualizado com sucesso!");
      router.push("/admin/imoveis");
      router.refresh();

    } catch (err: any) {
      console.error(err);
      alert("Erro ao atualizar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary font-bold">Carregando dados...</div>;

  const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">Editar Imóvel (Venda)</h1>
          <button type="button" onClick={() => router.back()} className="text-gray-400 hover:text-primary flex items-center text-sm font-medium transition-colors">
            <ArrowLeft size={16} className="mr-1"/> Voltar
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-8">
          
          {/* Fotos */}
          <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><ImageIcon size={20} className="text-primary" /> Gerenciar Fotos</h3>
            
            {/* Lista de Imagens Atuais */}
            {currentImages.length > 0 && (
              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {currentImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      <img src={img.url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm"><Trash2 size={12} /></button>
                    </div>
                  ))}
              </div>
            )}

            {/* Upload */}
             <label className="cursor-pointer block border-2 border-dashed border-gray-300 p-8 text-center rounded-xl hover:bg-white hover:border-primary/50 transition-all group">
                <span className="text-gray-500 group-hover:text-primary font-medium">Clique para adicionar novas fotos +</span>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
             </label>

             {/* Preview de Novas Imagens */}
             {newPreviews.length > 0 && (
                <div className="mt-6">
                    <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Novas imagens selecionadas:</p>
                    <div className="grid grid-cols-5 gap-4">
                       {newPreviews.map((src, i) => (
                           <div key={i} className="relative aspect-square">
                               <img src={src} className="w-full h-full object-cover rounded-lg border-2 border-primary" />
                               <button type="button" onClick={() => removeNewFile(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><Trash2 size={10}/></button>
                           </div>
                       ))}
                    </div>
                </div>
             )}
          </div>

          <hr className="border-gray-100" />

          {/* Dados de Texto */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelClass}>Código</label><input {...register("code")} className={inputClass} /></div>
              
              {/* SELECT DINÂMICO AQUI */}
              <div>
                <label className={labelClass}>Categoria</label>
                <select {...register("category")} className={inputClass}>
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-right mt-1">
                   Não achou? <a href="/admin/categorias" target="_blank" className="text-primary hover:underline">Criar nova categoria</a>
                </p>
              </div>

            </div>

            <div><label className={labelClass}>Título</label><input {...register("title")} className={inputClass} /></div>
            <div><label className={labelClass}>Descrição</label><textarea {...register("description")} rows={6} className={inputClass} /></div>

            {/* Valores com Condomínio - Cores Ajustadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-primary/20">
              <div><label className={labelClass}>Valor de Venda (R$)</label><input type="number" step="0.01" {...register("price")} className={inputClass} /></div>
              <div><label className={labelClass}>Condomínio (R$)</label><input type="number" step="0.01" {...register("condo_price")} className={inputClass} /></div>
            </div>
            
            {/* Endereço com Autocomplete */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AutocompleteInput 
                label="Cidade"
                value={currentCity}
                onChange={(val) => setValue("city", val, { shouldValidate: true, shouldDirty: true })}
                options={suggestedCities}
                placeholder="Ex: Novo Hamburgo"
              />
              <AutocompleteInput 
                label="Bairro"
                value={currentNeighborhood}
                onChange={(val) => setValue("neighborhood", val, { shouldValidate: true, shouldDirty: true })}
                options={suggestedNeighborhoods}
                placeholder="Ex: Centro"
              />
            </div>

            <div><label className={labelClass}>Endereço Completo</label><input {...register("address")} className={inputClass} /></div>
          </div>
          
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:text-primary hover:border-primary transition-all">Cancelar</button>
            <button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"><Save size={18} /> Salvar Alterações</button>
          </div>

        </form>
      </div>
    </main>
  );
}