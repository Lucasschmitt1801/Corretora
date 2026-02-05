"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export default function AutocompleteInput({
  label,
  value,
  onChange,
  options,
  placeholder = "Selecione ou digite..."
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sincroniza o valor interno se o valor externo mudar (ex: ao carregar dados na edição)
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtra as opções baseado no que foi digitado
  const filteredOptions = query === ""
    ? options
    : options.filter((opt) =>
        opt.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (option: string) => {
    setQuery(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    onChange(newVal);
    setIsOpen(true);
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 text-gray-900 shadow-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          autoComplete="off"
        />
        
        {/* Ícone de Seta para indicar que é uma lista */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Lista Flutuante (Dropdown) */}
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredOptions.map((option, idx) => (
            <li
              key={idx}
              className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-50 transition-colors"
              onClick={() => handleSelect(option)}
            >
              <span className={`block truncate ${option === value ? 'font-bold text-blue-600' : 'font-normal'}`}>
                {option}
              </span>

              {option === value && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <Check size={16} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}