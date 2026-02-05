"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPromptById } from "@/lib/prompts";
import { Prompt } from "@/types/prompt";
import ImageUploader, { UploadedImage } from "@/components/ImageUploader";
import PromptSelector from "@/components/PromptSelector";
import {
  HeaderSection,
  MainImageSection,
  FeaturesSection,
  RecommendationsSection,
  FooterSection,
  parseCopyText
} from "@/components/DetailPageSections";
import { renderToImage, downloadImage } from "@/lib/renderToImage";
import ApiKeySettings, { getStoredApiKey } from "@/components/ApiKeySettings";

function GeneratorContent() {
  const searchParams = useSearchParams();
  const promptId = searchParams.get("prompt");
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const [showSections, setShowSections] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // 섹션별 ref
  const headerRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 저장된 API 키 로드
  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) setApiKey(stored);
  }, []);

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
    if (!canGenerate || !selectedPrompt) return;
    
    setIsGenerating(true);
    setError(null);
    setGeneratedCopy(null);
    setGeneratedImage(null);
    
    try {
      // API 키 확인
      const currentApiKey = apiKey || getStoredApiKey();
      if (!currentApiKey) {
        throw new Error("API 키가 설정되지 않았습니다. 상단의 'API 키 필요' 버튼을 클릭하여 설정해주세요.");
      }

      // 1. 카피라이팅 생성
      setProgress("카피라이팅 생성 중...");
      const copyResponse = await fetch("/api/generate/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productDescription,
          apiKey: currentApiKey,
        }),
      });
      
      const copyData = await copyResponse.json();
      if (!copyData.success) {
        throw new Error(copyData.error || "카피 생성 실패");
      }
      setGeneratedCopy(copyData.copy);

      // 2. AI 이미지 생성
      setProgress("AI 연출컷 생성 중...");
      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("prompt", selectedPrompt.prompt_en);
      formData.append("apiKey", currentApiKey);
      if (images.length > 0) {
        formData.append("image", images[0].file);
      }

      const imageResponse = await fetch("/api/generate/image", {
        method: "POST",
        body: formData,
      });

      const imageData = await imageResponse.json();
      if (imageData.success && imageData.image) {
        setGeneratedImage(imageData.image);
      }

      setProgress("");
    } catch (err: any) {
      setError(err.message || "생성 중 오류가 발생했습니다.");
      setProgress("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedCopy(null);
    setGeneratedImage(null);
    setError(null);
  };

  // 개별 섹션 다운로드
  const downloadSection = async (
    ref: React.RefObject<HTMLDivElement>,
    sectionName: string
  ) => {
    setShowSections(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (!ref.current) {
        throw new Error(`${sectionName} 섹션을 찾을 수 없습니다.`);
      }
      
      const dataUrl = await renderToImage(ref.current);
      const filename = `${productName.replace(/\s+/g, "_")}_${sectionName}.jpg`;
      downloadImage(dataUrl, filename);
    } catch (err) {
      console.error(`${sectionName} 렌더링 오류:`, err);
      alert(`${sectionName} 이미지 생성 중 오류가 발생했습니다.`);
    } finally {
      setShowSections(false);
    }
  };

  // 전체 섹션 다운로드
  const downloadAllSections = async () => {
    if (!generatedCopy) return;
    
    const parsed = parseCopyText(generatedCopy);
    const sections = [
      { ref: headerRef, name: "01_헤더" },
      { ref: mainImageRef, name: "02_메인이미지" },
    ];
    
    if (parsed.features.length > 0) {
      sections.push({ ref: featuresRef, name: "03_제품특징" });
    }
    if (parsed.recommendations.length > 0) {
      sections.push({ ref: recommendationsRef, name: "04_추천대상" });
    }
    sections.push({ ref: footerRef, name: "05_배송안내" });

    setShowSections(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (const section of sections) {
      try {
        if (!section.ref.current) continue;
        const dataUrl = await renderToImage(section.ref.current);
        const filename = `${productName.replace(/\s+/g, "_")}_${section.name}.jpg`;
        downloadImage(dataUrl, filename);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`${section.name} 다운로드 오류:`, err);
      }
    }
    
    setShowSections(false);
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
          <ApiKeySettings onApiKeyChange={setApiKey} />
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
              {/* 에러 메시지 */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* 로딩 상태 */}
              {isGenerating && (
                <div className="h-full min-h-[500px] flex items-center justify-center">
                  <div className="text-center">
                    <svg className="animate-spin w-12 h-12 mx-auto mb-4 text-blue-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">{progress}</p>
                  </div>
                </div>
              )}

              {/* 생성 결과 */}
              {!isGenerating && generatedCopy && (
                <div className="p-6">
                  {/* 생성된 이미지 영역 */}
                  <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative">
                    {generatedImage ? (
                      <Image
                        src={generatedImage}
                        alt="AI 생성 이미지"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center px-4">
                        이미지 생성 중 오류가 발생했거나<br />이미지가 아직 생성되지 않았습니다
                      </p>
                    )}
                  </div>
                  
                  {/* 생성된 카피 */}
                  <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {generatedCopy}
                  </div>
                </div>
              )}

              {/* 초기 상태 */}
              {!isGenerating && !generatedCopy && !error && (
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

            {generatedCopy && !isGenerating && (
              <div className="space-y-3">
                <button 
                  onClick={downloadAllSections}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  전체 다운로드 (5개 이미지)
                </button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  또는 섹션별로 다운로드
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => downloadSection(headerRef, "01_헤더")}
                    className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    헤더
                  </button>
                  <button 
                    onClick={() => downloadSection(mainImageRef, "02_메인이미지")}
                    className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    메인 이미지
                  </button>
                  {parseCopyText(generatedCopy).features.length > 0 && (
                    <button 
                      onClick={() => downloadSection(featuresRef, "03_제품특징")}
                      className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                      제품 특징
                    </button>
                  )}
                  {parseCopyText(generatedCopy).recommendations.length > 0 && (
                    <button 
                      onClick={() => downloadSection(recommendationsRef, "04_추천대상")}
                      className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    >
                      추천 대상
                    </button>
                  )}
                  <button 
                    onClick={() => downloadSection(footerRef, "05_배송안내")}
                    className="py-2 px-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    배송 안내
                  </button>
                </div>

                <button 
                  onClick={handleReset}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  다시 생성
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 렌더링용 섹션들 (다운로드 중 표시) */}
      {showSections && generatedCopy && (() => {
        const parsed = parseCopyText(generatedCopy);
        return (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 50,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflow: "auto",
            padding: "32px 0"
          }}>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                zIndex: 10,
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "14px"
              }}>
                이미지 생성 중...
              </div>
              
              <HeaderSection ref={headerRef} headline={parsed.headline || productName} subheadline={parsed.subheadline} />
              <div style={{ height: "16px" }} />
              <MainImageSection ref={mainImageRef} productName={productName} imageUrl={generatedImage || (images.length > 0 ? images[0].preview : null)} />
              <div style={{ height: "16px" }} />
              {parsed.features.length > 0 && (
                <>
                  <FeaturesSection ref={featuresRef} features={parsed.features} />
                  <div style={{ height: "16px" }} />
                </>
              )}
              {parsed.recommendations.length > 0 && (
                <>
                  <RecommendationsSection ref={recommendationsRef} recommendations={parsed.recommendations} />
                  <div style={{ height: "16px" }} />
                </>
              )}
              <FooterSection ref={footerRef} />
            </div>
          </div>
        );
      })()}
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
