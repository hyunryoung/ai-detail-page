"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import PromptGrid from "@/components/PromptGrid";
import { getAllPrompts, getCategoriesWithCount, searchPrompts } from "@/lib/prompts";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const allPrompts = useMemo(() => getAllPrompts(), []);
  const categories = useMemo(() => getCategoriesWithCount(), []);
  
  const filteredPrompts = useMemo(() => {
    let prompts = allPrompts;
    
    // 카테고리 필터
    if (selectedCategory !== "all") {
      prompts = prompts.filter((p) => p.category === selectedCategory);
    }
    
    // 검색 필터
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      prompts = prompts.filter((p) => {
        const searchText = [
          p.title_cn,
          p.title_ko,
          p.prompt_en,
          ...p.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchText.includes(lowerQuery);
      });
    }
    
    return prompts;
  }, [allPrompts, selectedCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main className="min-h-screen">
      {/* 헤더 */}
      <header className="bg-gradient-to-b from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            AI 프롬프트 갤러리
          </h1>
          <p className="text-blue-100 dark:text-gray-400 mb-6">
            Nano Banana Pro 프롬프트로 완벽한 AI 이미지를 생성하세요
          </p>
          
          {/* 검색바 */}
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} placeholder="프롬프트 검색..." />
          </div>
          
          {/* 통계 */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="bg-white/10 px-3 py-1 rounded-full">
              총 {allPrompts.length.toLocaleString()}개 프롬프트
            </span>
            <Link
              href="/generator"
              className="bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors"
            >
              상세페이지 만들기 →
            </Link>
          </div>
        </div>
      </header>

      {/* 카테고리 필터 */}
      <section className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </section>

      {/* 프롬프트 그리드 */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {searchQuery && (
            <span>&quot;{searchQuery}&quot; 검색 결과: </span>
          )}
          {filteredPrompts.length.toLocaleString()}개 프롬프트
        </div>
        
        <PromptGrid prompts={filteredPrompts} />
        
        {/* 더 보기 안내 */}
        {filteredPrompts.length > 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>스크롤하여 더 많은 프롬프트를 확인하세요</p>
          </div>
        )}
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>AI 원클릭 상세페이지 자동화 시스템</p>
          <p className="mt-2">
            Powered by Nano Banana Pro & Gemini AI
          </p>
        </div>
      </footer>
    </main>
  );
}
