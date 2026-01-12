"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../../../../lib/supabase";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  X,
} from "lucide-react";

type PropertyFormData = {
  code: string;
  title: string;
  description: string;
  price: number;
  city: string;
  neighborhood: string;
  type: string;
  address: string;
  category: string;
};

type PropertyImage = {
  id: string;
  url: string;
};

export default function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { register, handleSubmit, reset } = useForm<PropertyFormData>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const [currentImages, setCurrentImages] = useState<PropertyImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // 🔹 Carregar dados do imóvel
  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_images (id, url, display_order)")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Erro ao carregar imóvel");
        router.push("/admin/imoveis");
        return;
      }

      const { property_images, ...textData } = data;

      // ✅ NORMALIZA NULL → STRING / NUMBER
      reset({
        code: textData.code ?? "",
        title: textData.title ?? "",
        description: textData.description ?? "",
        price: textData.price ?? 0,
        city: textData.city ?? "",
        neighborhood: textData.neighborhood ?? "",
        address: textData.address ?? "",
        type: textData.type ?? "venda",
        category: textData.category ?? "casa",
      });

      setCurrentImages(property_images ?? []);
      setIsLoading(false);
    }

    loadData();
  }, [id, reset, router]);

  // 🔹 Evita vazamento de memória dos previews
  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  // 🔹 Selecionar novas imagens
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 Excluir imagem existente (DB)
  const handleDeleteExistingImage = async (imageId: string) => {
    if (!confirm("Deseja excluir esta foto?")) return;

    const image = currentImages.find((img) => img.id === imageId);
    if (!image) return;

    const filePath = image.url.split("/imoveis/")[1];

    await supabase.storage.from("imoveis").remove([filePath]);
    await supabase.from("property_images").delete().eq("id", imageId);

    setCurrentImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // 🔹 Atualizar imóvel
  async function onUpdate(data: PropertyFormData) {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("properties")
        .update({
          ...data,
        })
        .eq("id", id);

      if (error) throw error;

      if (newFiles.length > 0) {
        const uploads = await Promise.all(
          newFiles.map(async (file, index) => {
            const ext = file.name.split(".").pop();
            const path = `${id}/${Date.now()}_${index}.${ext}`;

            await supabase.storage
              .from("imoveis")
              .upload(path, file, { upsert: false });

            const { data } = supabase.storage
              .from("imoveis")
              .getPublicUrl(path);

            return {
              property_id: id,
              url: data.publicUrl,
              display_order: currentImages.length + index + 1,
            };
          })
        );

        await supabase.from("property_images").insert(uploads);
      }

      alert("Imóvel atualizado com sucesso!");
      router.push("/admin/imoveis");
      router.refresh();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Carregando...
      </div>
    );
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 p-3";
  const labelClass = "block text-sm font-bold text-gray-700";

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Editar Imóvel</h1>
          <button onClick={() => router.back()} className="flex items-center">
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit(onUpdate)} className="space-y-6">
          <div>
            <label className={labelClass}>Título</label>
            <input {...register("title")} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              {...register("description")}
              rows={5}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            Salvar
          </button>
        </form>
      </div>
    </main>
  );
}