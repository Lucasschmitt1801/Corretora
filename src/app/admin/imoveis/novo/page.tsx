"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../../../lib/supabase"; 
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, UploadCloud, X } from "lucide-react";
// IMPORTANTE: Ajuste o caminho conforme onde você salvou o componente
import AutocompleteInput from "../../../../components/AutocompleteInput"; 

type PropertyFormData = {
  code: string; title: string; description: string; price: number; condo_price: number;
  city: string; neighborhood: string; address: string; category: string;
};

export default function NewPropertyPage() {
  // Adicionei setValue e watch aqui
  const { register, handleSubmit, setValue, watch } = useForm<PropertyFormData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);
  const [suggestedNeighborhoods, setSuggestedNeighborhoods] = useState<string[]>([]);

  // Monitora os valores atuais para passar pro componente visual
  const currentCity = watch("city");
  const currentNeighborhood = watch("neighborhood");

  useEffect(() => {
    async function fetchSuggestions() {
      const { data } = await supabase.from("properties").select("city, neighborhood");
      if (data) {
        // Cria listas únicas e ordenadas
        const cities = Array.from(new Set(data.map(p => p.city?.trim()).filter(Boolean))).sort();
        const neighborhoods = Array.from(new Set(data.map(p => p.neighborhood?.trim()).filter(Boolean))).sort();
        setSuggestedCities(cities);
        setSuggestedNeighborhoods(neighborhoods);
      }
    }
    fetchSuggestions();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      const previewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...previewUrls]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: PropertyFormData) {
    setIsLoading(true);
    try {
      const { data: insertedProperty, error: insertError } = await supabase
        .from("properties")
        .insert([{
          code: data.code,
          title: data.title,
          description: data.description,
          price: data.price || 0,
          condo_price: data.condo_price || 0,
          city: data.city.trim(),
          neighborhood: data.neighborhood.trim(),
          address: data.address,
          type: 'venda',
          category: data.category,
          status: 'disponivel'
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const propertyId = insertedProperty.id;

      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file, index) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${propertyId}/${Date.now()}_${index}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from("imoveis").upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from("imoveis").getPublicUrl(fileName);
          return {
            property_id: propertyId,
            url: publicUrlData.publicUrl,
            display_order: index + 1
          };
        });
        await Promise.all(uploadPromises);
        await supabase.from("property_images").insert(await Promise.all(uploadPromises));
      }

      alert("Imóvel cadastrado com sucesso!");
      router.push("/admin/imoveis");
      router.refresh();

    } catch (error: any) {
      console.error(error);
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Novo Imóvel (Venda)</h1>
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 flex items-center text-sm font-medium">
            <ArrowLeft size={16} className="mr-1"/> Voltar
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Upload de Fotos - Mantido igual */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
             {/* ... Código do upload (igual ao anterior) ... */}
             <div className="mb-4">
                <label className="cursor-pointer inline-flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg hover:bg-white hover:border-gray-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">Clique para selecionar fotos</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
                </label>
             </div>
             {previews.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr />

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Código (Ref)</label>
                <input {...register("code", { required: true })} placeholder="Ex: CA0123" className={inputClass} />
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
              <input {...register("title", { required: true })} placeholder="Ex: Casa linda no centro..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descrição Detalhada</label>
              <textarea {...register("description")} rows={5} className={inputClass} placeholder="Detalhes sobre o imóvel..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div>
                <label className={labelClass}>Valor de Venda (R$)</label>
                <input type="number" step="0.01" {...register("price", { required: true })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Valor Condomínio (R$)</label>
                <input type="number" step="0.01" {...register("condo_price")} placeholder="0,00" className={inputClass} />
              </div>
            </div>
            
            {/* === AQUI É A MUDANÇA PRINCIPAL === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Componente Autocomplete de Cidade */}
              <AutocompleteInput 
                label="Cidade"
                value={currentCity}
                onChange={(val) => setValue("city", val)}
                options={suggestedCities}
                placeholder="Ex: Novo Hamburgo"
              />

              {/* Componente Autocomplete de Bairro */}
              <AutocompleteInput 
                label="Bairro"
                value={currentNeighborhood}
                onChange={(val) => setValue("neighborhood", val)}
                options={suggestedNeighborhoods}
                placeholder="Ex: Centro"
              />

            </div>
            {/* =================================== */}

            <div>
              <label className={labelClass}>Endereço (Rua, Número)</label>
              <input {...register("address")} className={inputClass} />
            </div>

          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-4 rounded-lg font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl disabled:opacity-70"
            >
              <Save size={20} />
              {isLoading ? "Cadastrando..." : "Cadastrar Imóvel"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}