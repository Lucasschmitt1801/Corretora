"use client";

import { useForm } from "react-hook-form";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";

type PropertyFormData = {
  code: string;
  title: string;
  description: string;
  price: number;
  city: string;
  neighborhood: string;
  type: string;
  address: string;
};

export default function NewPropertyPage() {
  const { register, handleSubmit, reset } = useForm<PropertyFormData>();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Cadastrar Imóvel");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Função para lidar com a seleção de múltiplas fotos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      // Cria previews para mostrar na tela
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remover uma foto da lista antes de enviar
  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  async function onSubmit(data: PropertyFormData) {
    setIsLoading(true);
    setLoadingText("Salvando dados...");

    // Variável para rastrear se o imóvel foi criado (para caso precise desfazer)
    let createdPropertyId: string | null = null;

    try {
      // 1. Inserir Imóvel
      const { data: property, error: propError } = await supabase
        .from("properties")
        .insert({
          code: data.code,
          title: data.title,
          description: data.description,
          price: data.price,
          city: data.city,
          neighborhood: data.neighborhood,
          address: data.address,
          type: data.type,
          category: "casa",
          status: "disponivel",
        })
        .select()
        .single();

      if (propError) throw propError;

      // Se chegou aqui, o imóvel foi criado. Guardamos o ID.
      if (property) createdPropertyId = property.id;

      // 2. Upload das Imagens (Loop)
      if (selectedFiles.length > 0 && property) {
        setLoadingText(`Enviando ${selectedFiles.length} fotos...`);

        // Prepara todos os uploads para irem juntos (Promise.all é mais rápido)
        const uploadPromises = selectedFiles.map(async (file, index) => {
          const fileExt = file.name.split(".").pop();
          // Nome único: ID_IMOVEL/timestamp_indice.jpg
          const fileName = `${property.id}/${Date.now()}_${index}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("imoveis")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("imoveis")
            .getPublicUrl(fileName);

          return {
            property_id: property.id,
            url: publicUrlData.publicUrl,
            display_order: index, // A primeira foto selecionada será a capa (0)
          };
        });

        // Aguarda todos os uploads terminarem
        const imagesToInsert = await Promise.all(uploadPromises);

        // 3. Salva os links no banco
        const { error: imgDbError } = await supabase
          .from("property_images")
          .insert(imagesToInsert);

        if (imgDbError) throw imgDbError;
      }

      alert("Imóvel cadastrado com sucesso!");
      router.push("/admin/imoveis"); 
      router.refresh();

    } catch (err: any) {
      console.error(err);
      
      // --- ROLLBACK DE SEGURANÇA ---
      // Se deu erro (nas imagens, internet, etc) e o imóvel já tinha sido criado, nós apagamos ele.
      if (createdPropertyId) {
        console.log("Erro detectado. Apagando imóvel criado parcialmente...");
        await supabase.from("properties").delete().eq("id", createdPropertyId);
      }

      alert("Erro: " + err.message + "\n(O cadastro foi cancelado, tente novamente)");
    } finally {
      setIsLoading(false);
      setLoadingText("Cadastrar Imóvel");
    }
  }

  // Estilos comuns para os inputs
  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 bg-white p-3 text-black shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 placeholder-gray-400";

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
          Cadastrar Novo Imóvel
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* ÁREA DE FOTOS (Múltiplas) */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
            <label className="block text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon /> Fotos do Imóvel
            </label>
            
            <input
              type="file"
              multiple // <--- Permite selecionar vários
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800 cursor-pointer"
            />

            {/* Preview das imagens selecionadas */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative group">
                    <img src={src} alt="Preview" className="h-24 w-full object-cover rounded-md shadow-sm" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-tr-md">
                        Capa
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              A primeira foto selecionada será a foto de capa (Destaque).
            </p>
          </div>

          {/* DADOS DO IMÓVEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700">Código (Referência)</label>
              <input {...register("code", { required: true })} className={inputClass} placeholder="Ex: CA-001" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Tipo de Negócio</label>
              <select {...register("type")} className={inputClass}>
                <option value="venda">Venda</option>
                <option value="aluguel">Aluguel</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Título do Anúncio</label>
            <input {...register("title", { required: true })} className={inputClass} placeholder="Ex: Casa com piscina no centro" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700">Descrição Detalhada</label>
            <textarea {...register("description")} rows={5} className={inputClass} placeholder="Descreva todos os detalhes do imóvel..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700">Valor (R$)</label>
              <input type="number" step="0.01" {...register("price", { required: true })} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700">Endereço (Rua e Número)</label>
              <input {...register("address")} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700">Cidade</label>
              <input {...register("city", { required: true })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Bairro</label>
              <input {...register("neighborhood", { required: true })} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-black transition-all shadow-md disabled:bg-gray-400 mt-4"
          >
            {isLoading ? loadingText : "Finalizar Cadastro"}
          </button>
        </form>
      </div>
    </main>
  );
}