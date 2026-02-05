"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPromptById } from "@/lib/prompts";
import { Prompt } from "@/types/prompt";
import ImageUploader, { UploadedImage } from "@/components/ImageUploader";
import PromptSelector from "@/components/PromptSelector";

function GeneratorContent() {
  const searchParams = useSearchParams();
  const promptId = searchParams.get("prompt");
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);

  useEffect(() => {
    if (promptId) {
      const prompt = getPromptById(promptId);
      if (prompt) {
        setSelectedPrompt(prompt);
      }
    }
  }, [promptId]);

  const canGenerate = selectedPrompt && images.length > 0 && productName.trim();

  const handleGenerate = async () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    
    // TODO: 실제 AI 생성 로직 연동
    // 1. Nano Banana Pro로 연출컷 생성
    // 2. Gemini로 카피라이팅 생성
    // 3. 상세페이지 렌더링
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGeneratedCopy(`
[제품명: ${productName}]

✨ ${productDescription || "최고의 품질, 최고의 가치"}

🎯 주요 특징
• 프리미엄 품질의 제품
• 세심한 디테일과 마감
• 오랜 사용에도 변함없는 내구성

💝 이런 분께 추천드려요
• 품질을 중요시하는 분
• 특별한 선물을 찾으시는 분
• 감각적인 인테리어를 원하시는 분

📦 배송 안내
• 주문 후 1-3일 내 출고
• 안전한 포장으로 배송
    `.trim());
    
    setIsGenerating(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
            <span>←</span>
            <span>갤러리</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            상세페이지 만들기
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 입력 섹션 */}
          <div className="space-y-6">
            {/* 프롬프트 선택 */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                1. AI 스타일 선택
              </h2>
              <PromptSelector 
                selectedPrompt={selectedPrompt}
                onSelect={setSelectedPrompt}
              />
            </section>

            {/* 이미지 업로드 */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                2. 제품 이미지 업로드
              </h2>
              <ImageUploader onImagesChange={setImages} maxImages={5} />
            </section>

            {/* 제품 정보 */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                3. 제품 정보 입력
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    제품명 *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="예: 프리미엄 무선 이어폰"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    제품 설명 (선택)
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="제품의 특징이나 강조하고 싶은 점을 입력하세요"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* 생성 버튼 */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                canGenerate && !isGenerating
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  AI가 상세페이지를 만들고 있어요...
                </span>
              ) : (
                "상세페이지 생성하기"
              )}
            </button>
          </div>

          {/* 미리보기 섹션 */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              미리보기
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
              {generatedCopy ? (
                <div className="p-6">
                  {/* 생성된 이미지 영역 */}
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg mb-6 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
                      AI 생성 이미지가<br />여기에 표시됩니다
                    </p>
                  </div>
                  
                  {/* 생성된 카피 */}
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {generatedCopy}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>프롬프트와 이미지를 선택하고<br />생성 버튼을 눌러주세요</p>
                  </div>
                </div>
              )}
            </div>

            {generatedCopy && (
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                  JPG로 다운로드
                </button>
                <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
                  다시 생성
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <GeneratorContent />
    </Suspense>
  );
}
