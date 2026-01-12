"use client";

import { useEffect, useState, use } from "react"; 
import { useForm } from "react-hook-form";
import { supabase } from "../../../../../lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, UploadCloud, X } from "lucide-react";

type PropertyFormData = {
  code: string; title: string; description: string; price: number;
  city: string; neighborhood: string; type: string; address: string; category: string;
};

// Interface para as imagens que vêm do banco
type PropertyImage = {
  id: string;
  url: string;
};

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { register, handleSubmit, reset } = useForm<PropertyFormData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para gerenciar imagens
  const [currentImages, setCurrentImages] = useState<PropertyImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // 1. Carregar dados do Imóvel + Imagens
  useEffect(() => {
    async function loadData() {
      // Busca imóvel e suas imagens
      const { data, error } = await supabase
        .from("properties")
        .select(`*, property_images (id, url, display_order)`)
        .eq("id", id)
        .single();

      if (error) {
        alert("Erro ao carregar imóvel");
        router.push("/admin/imoveis");
      } else {
        // Separa os dados: texto pro formulário, imagens pro estado visual
        const { property_images, ...textData } = data;

        reset({
          code: textData.code || "",
         title: textData.title || "",
         description: textData.description || "", // O erro principal estava aqui
         price: textData.price || 0,
         city: textData.city || "",
         neighborhood: textData.neighborhood || "",
         address: textData.address || "",
            type: textData.type || "venda",
            category: textData.category || "casa"
            });
        // Ordena imagens antigas (opcional, aqui assumindo ordem de criação ou display_order)
        setCurrentImages(property_images || []);
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, reset, router]);

  // --- LÓGICA DE IMAGENS ---

  // Selecionar novas fotos do computador
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);

      // Previews para mostrar na tela antes de salvar
      const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setNewPreviews((prev) => [...prev, ...previewUrls]);
    }
  };

  // Remover foto NOVA (que ainda não foi salva)
  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Excluir foto ANTIGA (Já salva no banco)
  const handleDeleteExistingImage = async (imageId: string) => {
    const confirm = window.confirm("Tem certeza que deseja excluir esta foto?");
    if (!confirm) return;

    try {
      // Deleta da tabela property_images
      const { error } = await supabase
        .from("property_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      // Atualiza a tela removendo a imagem
      setCurrentImages((prev) => prev.filter((img) => img.id !== imageId));

    } catch (err: any) {
      alert("Erro ao excluir imagem: " + err.message);
    }
  };

  // --- SALVAR TUDO ---
  async function onUpdate(data: PropertyFormData) {
    setIsLoading(true);
    try {
      // 1. Atualiza dados de texto
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          code: data.code,
          title: data.title,
          description: data.description,
          price: data.price,
          city: data.city,
          neighborhood: data.neighborhood,
          address: data.address,
          type: data.type,
          category: data.category
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // 2. Se houver NOVAS fotos, faz upload e insere
      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file, index) => {
          const fileExt = file.name.split(".").pop();
          // Nome único com timestamp para não dar conflito
          const fileName = `${id}/${Date.now()}_new_${index}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("imoveis")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("imoveis")
            .getPublicUrl(fileName);

          return {
            property_id: id,
            url: publicUrlData.publicUrl,
            // display_order pode ser melhorado futuramente, aqui jogamos no final
            display_order: 99 
          };
        });

        const imagesToInsert = await Promise.all(uploadPromises);

        const { error: imgDbError } = await supabase
          .from("property_images")
          .insert(imagesToInsert);

        if (imgDbError) throw imgDbError;
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
      Carregando dados...
    </div>
  );

  const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-400";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Editar Imóvel</h1>
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium"
          >
            <ArrowLeft size={16} className="mr-1"/> Voltar
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-8">
          
          {/* --- GERENCIAMENTO DE FOTOS --- */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon size={20} /> Gerenciar Fotos
            </h3>

            {/* Fotos Atuais */}
            {currentImages.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Fotos Já Salvas</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {currentImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                      <img src={img.url} alt="Foto" className="w-full h-full object-cover" />
                      {/* Botão de Excluir Foto */}
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-90 hover:bg-red-700 transition-all shadow-md"
                        title="Excluir foto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar Novas */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Adicionar Novas Fotos</p>
              
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-1" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> novas fotos</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
              </label>

              {/* Preview das Novas Fotos */}
              {newPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
                  {newPreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-green-300 ring-2 ring-green-100">
                      <img src={src} alt="Nova" className="w-full h-full object-cover opacity-80" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="absolute top-1 right-1 bg-gray-800 text-white p-1 rounded-full hover:bg-black"
                      >
                        <X size={12} />
                      </button>
                      <span className="absolute bottom-0 w-full text-center bg-green-600 text-white text-[10px] py-0.5">
                        Nova
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* --- DADOS DE TEXTO (Igual ao anterior) --- */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Código</label>
                <input {...register("code")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tipo de Negócio</label>
                <select {...register("type")} className={inputClass}>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Categoria</label>
                <select {...register("category")} className={inputClass}>
                  <option value="casa">Casa</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="sala_comercial">Sala Comercial</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Título do Anúncio</label>
              <input {...register("title")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descrição Detalhada</label>
              <textarea {...register("description")} rows={6} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input type="number" step="0.01" {...register("price")} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Endereço Completo</label>
                <input {...register("address")} className={inputClass} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Cidade</label>
                <input {...register("city")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bairro</label>
                <input {...register("neighborhood")} className={inputClass} />
              </div>
            </div>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="w-full md:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full md:w-auto flex-1 bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
            >
              <Save size={18} />
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}