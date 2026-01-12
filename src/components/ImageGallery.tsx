"use client"; // Isso permite interatividade (onClick, useState)

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageGalleryProps {
  images: { url: string }[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  // Estado para saber qual foto está sendo exibida no destaque
  // Começa com a primeira foto (índice 0) ou null se não tiver fotos
  const [selectedIndex, setSelectedIndex] = useState(0);

  const mainImage = images[selectedIndex]?.url;

  return (
    <div className="space-y-4">
      {/* Foto Principal (Destaque) */}
      <div className="bg-gray-200 rounded-xl overflow-hidden shadow-sm aspect-video relative group border border-gray-200">
        {mainImage ? (
          <img
            src={mainImage}
            alt={`${title} - Foto Principal`}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col">
            <ImageIcon size={48} className="mb-2 opacity-50" />
            <span className="text-lg font-medium">Sem foto disponível</span>
          </div>
        )}
      </div>

      {/* Grid de Miniaturas */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedIndex(index)} // Troca a foto principal ao clicar
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                index === selectedIndex
                  ? "border-gray-900 opacity-100 ring-2 ring-gray-300" // Estilo da foto selecionada
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}