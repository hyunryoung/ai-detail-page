"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getPromptById, getRandomPrompts } from "@/lib/prompts";
import { Prompt } from "@/types/prompt";
import PromptCard from "@/components/PromptCard";

interface PromptDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { id } = use(params);
  const prompt = getPromptById(id);
  const [copied, setCopied] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  const relatedPrompts = getRandomPrompts(5);

  if (!prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            프롬프트를 찾을 수 없습니다
          </h1>
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const title = prompt.title_ko || prompt.title_cn;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
            <span>←</span>
            <span>갤러리로 돌아가기</span>
          </Link>
          <Link
            href={`/generator?prompt=${id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            이 프롬프트로 상세페이지 만들기
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 이미지 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              {!imageError && prompt.thumbnail_url ? (
                <Image
                  src={prompt.thumbnail_url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* 프롬프트 정보 */}
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full mb-3">
                {prompt.category_ko}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 프롬프트 */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Prompt</h3>
                  <button
                    onClick={() => handleCopy(prompt.prompt_en, "prompt")}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {copied === "prompt" ? "✓ 복사됨" : "복사"}
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {prompt.prompt_en}
                </p>
              </div>

              {prompt.negative_prompt_en && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">Negative Prompt</h3>
                    <button
                      onClick={() => handleCopy(prompt.negative_prompt_en, "negative")}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {copied === "negative" ? "✓ 복사됨" : "복사"}
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {prompt.negative_prompt_en}
                  </p>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <Link
                href={`/generator?prompt=${id}`}
                className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                상세페이지 만들기
              </Link>
              {prompt.source_url && (
                <a
                  href={prompt.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  원본 보기
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 관련 프롬프트 */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            다른 프롬프트 둘러보기
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedPrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
