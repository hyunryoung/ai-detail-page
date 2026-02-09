"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { removeBackground } from "@imgly/background-removal";
import type { ProductAnalysis, SectionContents, SectionMeta } from "@/types/sections";
import { DEFAULT_SECTIONS } from "@/types/sections";
import {
  HeroSection, BrandStorySection, TargetSection, FeaturesSection,
  ManufacturingSection, CertificationSection, SpecsSection, PurchaseSection,
  HowToUseSection, ReviewsSection, FAQSection, ShippingSection,
} from "@/components/sections";

type Step = "upload" | "generating" | "preview";

export default function GeneratorV3Page() {
  // 상태
  const [step, setStep] = useState<Step>("upload");
  const [apiKey, setApiKey] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [cutoutImage, setCutoutImage] = useState<string | null>(null);
  const [cutoutFile, setCutoutFile] = useState<File | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [sellingPoints, setSellingPoints] = useState("");
  const [productName, setProductName] = useState("");
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [sectionContents, setSectionContents] = useState<SectionContents | null>(null);
  const [sections, setSections] = useState<SectionMeta[]>(DEFAULT_SECTIONS);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [brandStoryImage, setBrandStoryImage] = useState<string | null>(null);
  const [howToUseImages, setHowToUseImages] = useState<string[]>([]);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // 섹션 refs
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // API 키 로드
  useEffect(() => {
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) setApiKey(saved);
  }, []);

  // API 키 저장
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  // 이미지 업로드 + 자동 누끼
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 원본 미리보기
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage({ file, preview: reader.result as string });
    };
    reader.readAsDataURL(file);

    // 자동 배경 제거 (누끼)
    setIsRemovingBg(true);
    setCutoutImage(null);
    try {
      const blob = await removeBackground(file, {
        output: { format: "image/png" },
      });
      // blob → File 객체 (AI 전송용)
      const cutoutFileObj = new File([blob], "cutout.png", { type: "image/png" });
      setCutoutFile(cutoutFileObj);
      // blob → base64 (미리보기 + html-to-image 호환)
      const cutoutReader = new FileReader();
      cutoutReader.onload = () => {
        setCutoutImage(cutoutReader.result as string);
      };
      cutoutReader.readAsDataURL(blob);
    } catch (err) {
      console.error("배경 제거 실패:", err);
      // 실패 시 원본 이미지 사용
    }
    setIsRemovingBg(false);
  }, []);

  // === 메인 생성 파이프라인 ===
  const handleGenerate = async () => {
    if (!uploadedImage || !apiKey) {
      setError("이미지와 API 키를 입력해주세요.");
      return;
    }

    setStep("generating");
    setError("");

    try {
      // Step 1: 제품 분석
      setProgress("제품 이미지 분석 중...");
      const formData = new FormData();
      formData.append("image", uploadedImage.file);
      formData.append("apiKey", apiKey);

      const analyzeRes = await fetch("/api/analyze", { method: "POST", body: formData });
      const analyzeData = await analyzeRes.json();

      if (!analyzeData.success) throw new Error(analyzeData.error);
      const productAnalysis: ProductAnalysis = analyzeData.analysis;

      // 사용자 입력으로 분석 결과 보완
      if (productName.trim()) {
        productAnalysis.productName = productName.trim();
      }
      if (sellingPoints.trim()) {
        const points = sellingPoints.split("\n").filter(p => p.trim());
        if (points.length > 0) {
          productAnalysis.keyFeatures = points;
        }
      }

      setAnalysis(productAnalysis);

      // Step 2: 섹션별 텍스트 생성
      setProgress("상세페이지 콘텐츠 생성 중...");
      const sectionsRes = await fetch("/api/generate/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis: productAnalysis, apiKey }),
      });
      const sectionsData = await sectionsRes.json();

      if (!sectionsData.success) throw new Error(sectionsData.error);
      setSectionContents(sectionsData.sections);

      // Step 3: AI 이미지 생성
      const totalImages = 5;
      let imgCount = 0;

      // 3-1. 히어로 이미지 (누끼 제품 + 배경 합성)
      imgCount++;
      setProgress(`AI 이미지 생성 중 (${imgCount}/${totalImages})... 히어로 컨셉샷`);
      const heroPrompt = productAnalysis.category === "food"
        ? `Place this product naturally on a beautiful traditional Korean wooden table. Warm natural lighting, ceramic bowls and dried herbs around. Premium food product photography, magazine quality.`
        : `Place this product in a premium elegant setting. Soft studio lighting, bokeh effects, luxurious surface. Professional commercial photography, magazine quality.`;
      // 누끼 이미지가 있으면 누끼로, 없으면 원본으로 전송
      const heroInputFile = cutoutFile || uploadedImage.file;
      const heroImg = await generateImage(productAnalysis.productName, heroPrompt + " No text, no watermarks. 860px width.", heroInputFile, apiKey);
      if (heroImg) setHeroImage(heroImg);

      // 3-2. 브랜드 스토리 장면 (제품 없이 분위기 장면)
      imgCount++;
      setProgress(`AI 이미지 생성 중 (${imgCount}/${totalImages})... 브랜드 스토리`);
      const brandPrompt = `${productAnalysis.category === "food" ? "Traditional Korean artisan in hanbok carefully preparing herbal medicine in a warm traditional Korean room with wooden shelves and ceramic jars" : "Premium brand craftsmanship scene, artisan at work in a beautiful workshop"}. Cinematic lighting, highly detailed, professional photography. No text, no logos.`;
      const brandImg = await generateImage(productAnalysis.productName, brandPrompt, null, apiKey);
      if (brandImg) setBrandStoryImage(brandImg);

      // 3-3~5. 사용법 스텝별 이미지 (제품 없이 장면만)
      const howToImgs: string[] = [];
      const stepPrompts = getHowToUseImagePrompts(productAnalysis);
      for (let i = 0; i < stepPrompts.length; i++) {
        imgCount++;
        setProgress(`AI 이미지 생성 중 (${imgCount}/${totalImages})... 사용법 Step ${i + 1}`);
        const img = await generateImage(productAnalysis.productName, stepPrompts[i], null, apiKey);
        howToImgs.push(img || "");
      }
      setHowToUseImages(howToImgs);

      setProgress("");
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "생성 중 오류가 발생했습니다.");
      setStep("upload");
    }
  };

  // 사용법 이미지 프롬프트 생성
  const getHowToUseImagePrompts = (a: ProductAnalysis): string[] => {
    if (a.usageType === "oral") {
      return [
        `Close-up photo of a woman's hand holding small herbal pills/supplements on her palm, clean bright background, soft natural lighting. Professional health product photography. No text.`,
        `A glass of clean water with small herbal pills beside it on a minimal white table, morning sunlight, healthy lifestyle. Professional photography. No text.`,
        `A sealed glass jar of herbal supplements stored neatly on a clean shelf in a cool dry place, organized storage. Professional photography. No text.`,
      ];
    } else if (a.usageType === "topical") {
      return [
        `Close-up of a woman's hand applying a small amount of skincare cream/serum from a jar, clean bathroom background. Professional beauty photography. No text.`,
        `Woman gently applying skincare product on her face/skin with soft upward strokes, soft lighting. Professional beauty photography. No text.`,
        `Woman patting her face gently to help absorb skincare product, dewy glowing skin, soft lighting. Professional beauty photography. No text.`,
      ];
    }
    return [
      `Professional product usage step 1 scene, clean and minimal, soft lighting. No text.`,
      `Professional product usage step 2 scene, clean and minimal, soft lighting. No text.`,
      `Professional product usage step 3 scene, clean and minimal, soft lighting. No text.`,
    ];
  };

  // 이미지 생성 헬퍼
  const generateImage = async (productName: string, prompt: string, imageFile: File | null, key: string): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append("productName", productName);
      fd.append("prompt", prompt);
      fd.append("apiKey", key);
      if (imageFile) fd.append("image", imageFile);

      const res = await fetch("/api/generate/image", { method: "POST", body: fd });
      const data = await res.json();
      return data.success ? data.image : null;
    } catch {
      return null;
    }
  };

  // 섹션 토글
  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  // 전체 다운로드
  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setProgress("이미지 렌더링 중...");

    try {
      const zip = new JSZip();
      const individualFolder = zip.folder("개별이미지");
      const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);
      const allImages: string[] = [];

      for (let i = 0; i < enabledSections.length; i++) {
        const section = enabledSections[i];
        const el = sectionRefs.current[section.id];
        if (!el) continue;

        setProgress(`렌더링 중 (${i + 1}/${enabledSections.length})...`);

        try {
          const dataUrl = await toPng(el, { pixelRatio: 2, cacheBust: true });
          allImages.push(dataUrl);

          // 개별 이미지
          const base64 = dataUrl.split(",")[1];
          individualFolder?.file(`${String(i + 1).padStart(2, "0")}_${section.nameKo}.png`, base64, { base64: true });
        } catch (err) {
          console.error(`Failed to render ${section.id}:`, err);
        }
      }

      // 합본 이미지 생성
      if (allImages.length > 0) {
        setProgress("합본 이미지 생성 중...");
        const mergedDataUrl = await mergeImages(allImages);
        if (mergedDataUrl) {
          const mergedBase64 = mergedDataUrl.split(",")[1];
          zip.file(`${analysis?.productName || "상세페이지"}_전체.png`, mergedBase64, { base64: true });
        }
      }

      // ZIP 다운로드
      setProgress("ZIP 파일 생성 중...");
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysis?.productName || "상세페이지"}_상세페이지.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }

    setIsDownloading(false);
    setProgress("");
  };

  // 이미지 합치기
  const mergeImages = async (images: string[]): Promise<string | null> => {
    return new Promise((resolve) => {
      const loadedImages: HTMLImageElement[] = [];
      let loaded = 0;

      images.forEach((src, i) => {
        const img = new Image();
        img.onload = () => {
          loadedImages[i] = img;
          loaded++;
          if (loaded === images.length) {
            const canvas = document.createElement("canvas");
            canvas.width = loadedImages[0]?.width || 1720;
            const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0);
            canvas.height = totalHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) { resolve(null); return; }

            let y = 0;
            loadedImages.forEach((img) => {
              ctx.drawImage(img, 0, y);
              y += img.height;
            });

            resolve(canvas.toDataURL("image/png"));
          }
        };
        img.onerror = () => { loaded++; };
        img.src = src;
      });
    });
  };

  // === 렌더링 ===
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">AI 상세페이지 V3</h1>
            {step === "preview" && (
              <span className="text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded">생성 완료</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {step === "preview" && (
              <>
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isDownloading ? "다운로드 중..." : "ZIP 다운로드"}
                </button>
                <button
                  onClick={() => { setStep("upload"); setAnalysis(null); setSectionContents(null); setHeroImage(null); setBrandStoryImage(null); setHowToUseImages([]); }}
                  className="px-4 py-2 text-gray-600 text-sm rounded-lg border hover:bg-gray-50"
                >
                  새로 만들기
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Step 1: 업로드 */}
      {step === "upload" && (
        <div className="max-w-2xl mx-auto py-16 px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">상세페이지 자동 생성</h2>
            <p className="text-gray-500">제품 사진 한 장으로 전문 상세페이지를 만들어보세요</p>
          </div>

          {/* API 키 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gemini API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="API 키를 입력하세요"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* 제품명 (선택) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              제품명 <span className="text-gray-400 font-normal">(선택 - AI가 자동 인식하지만 직접 입력하면 더 정확)</span>
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 자연애본 발효어성초환"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* 셀링포인트 (선택) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              셀링포인트 <span className="text-gray-400 font-normal">(선택 - 줄바꿈으로 구분, AI 카피 품질이 올라갑니다)</span>
            </label>
            <textarea
              value={sellingPoints}
              onChange={(e) => setSellingPoints(e.target.value)}
              placeholder={"국내산 어성초 49% 고함량\nHACCP 인증 시설에서 제조\n무형문화재 명장의 발효 숙성 기술\n72시간 전통 발효 공법"}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
            />
          </div>

          {/* 이미지 업로드 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제품 이미지</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer">
                {uploadedImage ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-4">
                      {/* 원본 */}
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">원본</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={uploadedImage.preview} alt="원본" className="max-h-36 rounded-lg shadow" />
                      </div>
                      {/* 누끼 */}
                      <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">누끼</p>
                        {isRemovingBg ? (
                          <div className="w-36 h-36 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                            <span className="text-xs text-gray-400">배경 제거 중...</span>
                          </div>
                        ) : cutoutImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cutoutImage} alt="누끼" className="max-h-36 rounded-lg" style={{ background: "repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 50% / 16px 16px" }} />
                        ) : (
                          <div className="w-36 h-36 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-gray-400">대기 중</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">클릭하여 변경</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">제품 이미지를 업로드하세요</p>
                    <p className="text-xs text-gray-400">JPG, PNG (권장: 누끼 사진)</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleGenerate}
            disabled={!uploadedImage || !apiKey}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            상세페이지 생성하기
          </button>

          {error && <p className="mt-4 text-red-500 text-center text-sm">{error}</p>}
        </div>
      )}

      {/* Step 2: 생성 중 */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">상세페이지 생성 중</h3>
          <p className="text-gray-500">{progress || "잠시만 기다려주세요..."}</p>
        </div>
      )}

      {/* Step 3: 미리보기 */}
      {step === "preview" && sectionContents && analysis && (
        <div className="flex">
          {/* 좌측: 섹션 리스트 */}
          <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 h-[calc(100vh-53px)] sticky top-[53px] overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">섹션</h3>
            {sections.sort((a, b) => a.order - b.order).map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  const el = sectionRefs.current[section.id];
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center justify-between transition-colors ${
                  section.enabled
                    ? "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                    : "text-gray-400 line-through"
                }`}
              >
                <span>{section.nameKo}</span>
                <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={section.enabled}
                    onChange={() => toggleSection(section.id)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-gray-200 peer-checked:bg-blue-600 rounded-full peer-focus:ring-2 peer-focus:ring-blue-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] peer-checked:after:translate-x-full after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all" />
                </label>
              </button>
            ))}
          </aside>

          {/* 우측: 미리보기 */}
          <main className="flex-1 p-8 flex justify-center overflow-y-auto h-[calc(100vh-53px)]">
            <div className="w-[860px]">
              {sections
                .filter(s => s.enabled)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div key={section.id} ref={(el) => { sectionRefs.current[section.id] = el; }}>
                    {renderSection(section.id, sectionContents, analysis, cutoutImage || uploadedImage?.preview || null, heroImage, brandStoryImage, howToUseImages)}
                  </div>
                ))}
            </div>
          </main>
        </div>
      )}

      {/* 진행률 표시 */}
      {progress && step === "preview" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {progress}
        </div>
      )}
    </div>
  );
}

// 섹션 렌더 함수
function renderSection(
  id: string,
  contents: SectionContents,
  analysis: ProductAnalysis,
  productImage: string | null,
  heroImage: string | null,
  brandStoryImage: string | null,
  howToUseImages: string[],
) {
  const category = analysis.category;

  switch (id) {
    case "hero":
      return (
        <HeroSection
          {...contents.hero}
          category={category}
          productImage={productImage}
          backgroundImage={heroImage}
          brand={analysis.brand}
        />
      );
    case "brandStory":
      return (
        <BrandStorySection
          {...contents.brandStory}
          category={category}
          backgroundImage={brandStoryImage}
          productImage={productImage}
        />
      );
    case "target":
      return <TargetSection {...contents.target} category={category} productImage={productImage} />;
    case "features":
      return <FeaturesSection {...contents.features} category={category} productImage={productImage} />;
    case "manufacturing":
      return <ManufacturingSection {...contents.manufacturing} category={category} />;
    case "certification":
      return <CertificationSection {...contents.certification} category={category} />;
    case "specs":
      return <SpecsSection {...contents.specs} category={category} productImage={productImage} />;
    case "purchaseOptions":
      return <PurchaseSection {...contents.purchaseOptions} category={category} productImage={productImage} />;
    case "howToUse":
      return <HowToUseSection {...contents.howToUse} category={category} productImage={productImage} stepImages={howToUseImages} />;
    case "reviews":
      return <ReviewsSection {...contents.reviews} category={category} productImage={productImage} />;
    case "faq":
      return <FAQSection {...contents.faq} category={category} />;
    case "shipping":
      return <ShippingSection {...contents.shipping} category={category} />;
    default:
      return null;
  }
}
