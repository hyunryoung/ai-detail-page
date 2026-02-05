"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { getAllPrompts, getPromptsByCategory, searchPrompts } from "@/lib/prompts";
import { Prompt, CATEGORIES } from "@/types/prompt";

interface PromptSelectorProps {
  selectedPrompt: Prompt | null;
  onSelect: (prompt: Prompt) => void;
}

export default function PromptSelector({ selectedPrompt, onSelect }: PromptSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const prompts = useMemo(() => {
    if (search) {
      return searchPrompts(search);
    }
    if (category) {
      return getPromptsByCategory(category);
    }
    return getAllPrompts().slice(0, 50);
  }, [search, category]);

  const handleSelect = (prompt: Prompt) => {
    onSelect(prompt);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      {/* 선택된 프롬프트 또는 선택 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-left hover:border-blue-400 transition-colors"
      >
        {selectedPrompt ? (
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              {selectedPrompt.thumbnail_url ? (
                <Image
                  src={selectedPrompt.thumbnail_url}
                  alt={selectedPrompt.title_ko || selectedPrompt.title_cn}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {selectedPrompt.title_ko || selectedPrompt.title_cn}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {selectedPrompt.category_ko}
              </p>
            </div>
            <span className="text-blue-600 text-sm">변경</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>프롬프트 선택하기</span>
          </div>
        )}
      </button>

      {/* 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-4xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden flex flex-col">
            {/* 헤더 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  프롬프트 선택
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 검색 */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="프롬프트 검색..."
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* 카테고리 */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setCategory(null)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    !category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  전체
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      category === cat.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {cat.name_ko}
                  </button>
                ))}
              </div>
            </div>

            {/* 프롬프트 그리드 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleSelect(prompt)}
                    className={`relative aspect-square rounded-lg overflow-hidden group ${
                      selectedPrompt?.id === prompt.id ? "ring-2 ring-blue-600" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700">
                      {prompt.thumbnail_url ? (
                        <Image
                          src={prompt.thumbnail_url}
                          alt={prompt.title_ko || prompt.title_cn}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-2">
                      <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                        {prompt.title_ko || prompt.title_cn}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {prompts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
