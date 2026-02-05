"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import { toPng } from "html-to-image";
import ApiKeySettings, { getStoredApiKey } from "@/components/ApiKeySettings";
import { sectionStructure, generateSectionPrompt } from "@/lib/designSystem";
import {
  HeroSection,
  BenefitsSection,
  ProductShotSection,
  HowToUseSection,
  CTASection,
  colorPalettes,
} from "@/components/SectionTemplates";

// 제품 분석 결과 타입
interface ProductAnalysis {
  brand: string;
  productName: string;
  productType: string;
  category: "skincare" | "food" | "electronics" | "fashion" | "household";
  mainColors: string[];
  brandTone: "luxury" | "natural" | "modern" | "playful";
  keyFeatures: string[];
  ingredients: string[];
  targetBenefits: string[];
  suggestedPromptStyle: string;
}

// 생성된 섹션 타입
interface GeneratedSection {
  id: number;
  name: string;
  nameKo: string;
  imageUrl: string | null;
  copyText: string;
  isGenerating: boolean;
  order: number;
}

// 단계 정의
type Step = "upload" | "analyze" | "generate" | "edit";

export default function GeneratorV2Page() {
  const [step, setStep] = useState<Step>("upload");
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // 업로드 상태
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // 생성 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
  const [generatedCopy, setGeneratedCopy] = useState<string>("");
  const [progress, setProgress] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  
  // 렌더링된 섹션 이미지 (템플릿 -> 이미지)
  const [renderedImages, setRenderedImages] = useState<Record<string, string>>({});
  const [isRendering, setIsRendering] = useState(false);
  
  // 섹션 템플릿 refs
  const heroRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const productShotRef = useRef<HTMLDivElement>(null);
  const howToUseRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // 섹션 클릭 핸들러
  const handleSectionClick = (sectionId: number) => {
    setSelectedSectionId(sectionId);
  };
  
  // 카피 텍스트 파싱
  const parseCopyText = useCallback((copyText: string) => {
    const lines = copyText.split("\n").filter(l => l.trim());
    
    // 헤드라인 추출
    const headline = lines[0]?.replace(/^[#\d.*]+\s*/, "").replace(/\*+/g, "").trim() || "";
    const subheadline = lines[1]?.replace(/^[#\d.*]+\s*/, "").replace(/\*+/g, "").trim() || "";
    
    // 특징/효능 추출
    const benefits: string[] = [];
    const steps: string[] = [];
    
    let inBenefits = false;
    let inSteps = false;
    
    for (const line of lines) {
      if (line.includes("특징") || line.includes("효과") || line.includes("장점")) {
        inBenefits = true;
        inSteps = false;
        continue;
      }
      if (line.includes("사용") || line.includes("방법")) {
        inBenefits = false;
        inSteps = true;
        continue;
      }
      
      const cleanLine = line.replace(/^[•\-*✨💎🌿⭐💫\d.]+\s*/, "").trim();
      if (cleanLine.length < 5) continue;
      
      if (inBenefits && benefits.length < 3) {
        benefits.push(cleanLine);
      } else if (inSteps && steps.length < 3) {
        steps.push(cleanLine);
      }
    }
    
    // 기본값
    if (benefits.length === 0 && analysis) {
      benefits.push(...analysis.targetBenefits.slice(0, 3));
    }
    
    return { headline, subheadline, benefits, steps };
  }, [analysis]);
  
  // 템플릿을 이미지로 렌더링
  const renderSectionToImage = async (
    ref: React.RefObject<HTMLDivElement | null>,
    sectionName: string
  ): Promise<string | null> => {
    if (!ref.current) return null;
    
    try {
      const dataUrl = await toPng(ref.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      return dataUrl;
    } catch (error) {
      console.error(`Failed to render ${sectionName}:`, error);
      return null;
    }
  };
  
  // 모든 섹션 렌더링
  const renderAllSections = async () => {
    if (!analysis) return;
    
    setIsRendering(true);
    setProgress("템플릿 렌더링 중...");
    
    const refs: { name: string; ref: React.RefObject<HTMLDivElement | null> }[] = [
      { name: "hero", ref: heroRef },
      { name: "benefits", ref: benefitsRef },
      { name: "product_shot", ref: productShotRef },
      { name: "how_to_use", ref: howToUseRef },
      { name: "cta", ref: ctaRef },
    ];
    
    // 잠시 대기 (DOM 렌더링 완료)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newRenderedImages: Record<string, string> = {};
    
    for (let i = 0; i < refs.length; i++) {
      const { name, ref } = refs[i];
      setProgress(`${i + 1}/${refs.length} 렌더링 중...`);
      
      const imageUrl = await renderSectionToImage(ref, name);
      if (imageUrl) {
        newRenderedImages[name] = imageUrl;
      }
      
      // 각 섹션 사이 약간의 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setRenderedImages(newRenderedImages);
    
    // generatedSections 업데이트
    setGeneratedSections(prev => prev.map(s => ({
      ...s,
      imageUrl: newRenderedImages[s.name] || s.imageUrl,
    })));
    
    setIsRendering(false);
    setProgress("");
  };

  // 전체 다운로드 핸들러 (ZIP 파일로)
  const handleDownloadAll = async () => {
    const sectionsWithImages = generatedSections.filter(s => s.imageUrl);
    if (sectionsWithImages.length === 0) {
      alert("다운로드할 이미지가 없습니다.");
      return;
    }

    setProgress("ZIP 파일 생성 중...");
    
    try {
      const zip = new JSZip();
      const productName = analysis?.productName || "product";
      const folderName = `${productName}_상세페이지`;
      
      // 개별 이미지 폴더 생성
      const individualFolder = zip.folder("개별이미지");
      
      // 이미지들을 로드하고 개별 파일로 저장
      const loadedImages: { img: HTMLImageElement; name: string; blob: Blob }[] = [];
      
      for (const section of sectionsWithImages) {
        if (section.imageUrl) {
          try {
            const response = await fetch(section.imageUrl);
            const blob = await response.blob();
            
            // 개별 이미지 ZIP에 추가
            individualFolder?.file(`${section.nameKo}.png`, blob);
            
            // 합성용 이미지 로드
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = section.imageUrl!;
            });
            loadedImages.push({ img, name: section.nameKo, blob });
          } catch (error) {
            console.error(`Failed to load ${section.name}:`, error);
          }
        }
      }
      
      // 모든 이미지를 세로로 합치기
      if (loadedImages.length > 0) {
        const targetWidth = 800; // 고정 너비
        let totalHeight = 0;
        const scaledDimensions: { width: number; height: number }[] = [];
        
        // 각 이미지의 스케일된 높이 계산
        for (const { img } of loadedImages) {
          const scale = targetWidth / img.naturalWidth;
          const scaledHeight = img.naturalHeight * scale;
          scaledDimensions.push({ width: targetWidth, height: scaledHeight });
          totalHeight += scaledHeight;
        }
        
        // 캔버스 생성
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = totalHeight;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          let currentY = 0;
          
          // 이미지들을 캔버스에 그리기
          for (let i = 0; i < loadedImages.length; i++) {
            const { img } = loadedImages[i];
            const { width, height } = scaledDimensions[i];
            ctx.drawImage(img, 0, currentY, width, height);
            currentY += height;
          }
          
          // 합쳐진 이미지를 Blob으로 변환
          const mergedBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, "image/png");
          });
          
          // 합쳐진 이미지 ZIP에 추가
          zip.file(`${productName}_전체_상세페이지.png`, mergedBlob);
        }
      }
      
      // 카피라이팅 텍스트도 추가
      if (generatedCopy) {
        zip.file("카피라이팅.txt", generatedCopy);
      }
      
      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress("");
    } catch (error) {
      console.error("ZIP 생성 실패:", error);
      alert("ZIP 파일 생성에 실패했습니다.");
      setProgress("");
    }
  };

  // 개별 이미지 다운로드
  const handleDownloadSingle = async (section: GeneratedSection) => {
    if (!section.imageUrl) return;
    try {
      const response = await fetch(section.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysis?.productName || "product"}_${section.name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to download ${section.name}:`, error);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setUploadedImage({ file, preview });
      setAnalysis(null);
      setAnalysisError(null);
    }
  };

  // 이미지 분석 시작
  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    
    const currentApiKey = apiKey || getStoredApiKey();
    if (!currentApiKey) {
      setAnalysisError("API 키가 설정되지 않았습니다.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setStep("analyze");

    try {
      const formData = new FormData();
      formData.append("image", uploadedImage.file);
      formData.append("apiKey", currentApiKey);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setAnalysisError(data.error || "분석 실패");
      }
    } catch (error: any) {
      setAnalysisError(error.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 개별 섹션 이미지 생성
  const generateSectionImage = async (
    sectionName: string,
    currentApiKey: string
  ): Promise<string | null> => {
    if (!analysis || !uploadedImage) return null;

    const prompt = generateSectionPrompt(sectionName, {
      brand: analysis.brand,
      productName: analysis.productName,
      category: analysis.category,
      mainColors: analysis.mainColors,
      brandTone: analysis.brandTone,
      targetBenefits: analysis.targetBenefits,
    });

    const formData = new FormData();
    formData.append("productName", `${analysis.brand} ${analysis.productName}`);
    formData.append("prompt", prompt);
    formData.append("apiKey", currentApiKey);
    
    // 연출컷에만 원본 이미지 포함
    if (sectionName === "product_shot") {
      formData.append("image", uploadedImage.file);
    }

    try {
      const response = await fetch("/api/generate/image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.success ? data.image : null;
    } catch {
      return null;
    }
  };

  // 상세페이지 생성 시작
  const handleGenerate = async () => {
    if (!analysis || !uploadedImage) return;

    const currentApiKey = apiKey || getStoredApiKey();
    if (!currentApiKey) {
      setAnalysisError("API 키가 설정되지 않았습니다.");
      return;
    }

    setIsGenerating(true);
    setStep("generate");

    // 생성할 섹션 목록
    const sectionsToGenerate = ["hero", "benefits", "product_shot", "how_to_use", "cta"];
    
    // 섹션 초기화
    const initialSections: GeneratedSection[] = sectionsToGenerate.map((name, idx) => {
      const sectionDef = sectionStructure.find(s => s.name === name);
      return {
        id: sectionDef?.id || idx + 1,
        name: name,
        nameKo: sectionDef?.nameKo || name,
        imageUrl: null,
        copyText: "",
        isGenerating: false,
        order: idx,
      };
    });
    setGeneratedSections(initialSections);

    try {
      // 1. 카피라이팅 생성
      setProgress("1/6 카피라이팅 생성 중...");
      const copyResponse = await fetch("/api/generate/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: `${analysis.brand} ${analysis.productName}`,
          productDescription: `${analysis.productType}. 주요 특징: ${analysis.keyFeatures.join(", ")}. 효능: ${analysis.targetBenefits.join(", ")}`,
          apiKey: currentApiKey,
        }),
      });
      
      const copyData = await copyResponse.json();
      if (copyData.success) {
        setGeneratedCopy(copyData.copy);
      }

      // 2. 각 섹션별 이미지 순차 생성
      for (let i = 0; i < sectionsToGenerate.length; i++) {
        const sectionName = sectionsToGenerate[i];
        const sectionDef = sectionStructure.find(s => s.name === sectionName);
        
        setProgress(`${i + 2}/6 ${sectionDef?.nameKo || sectionName} 생성 중...`);
        
        // 해당 섹션 생성 중 표시
        setGeneratedSections(prev => prev.map(s => 
          s.name === sectionName ? { ...s, isGenerating: true } : s
        ));

        const imageUrl = await generateSectionImage(sectionName, currentApiKey);
        
        // 섹션 업데이트
        setGeneratedSections(prev => prev.map(s => 
          s.name === sectionName ? { ...s, imageUrl, isGenerating: false } : s
        ));
      }

      setProgress("");
      setStep("edit");
      
      // 3. 템플릿 렌더링 (잠시 후 실행)
      setTimeout(() => {
        renderAllSections();
      }, 1000);
      
    } catch (error: any) {
      setAnalysisError(error.message || "생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 분석 정보 수정
  const handleAnalysisChange = (field: keyof ProductAnalysis, value: any) => {
    if (analysis) {
      setAnalysis({ ...analysis, [field]: value });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">
            <span>←</span>
            <span>갤러리</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            AI 상세페이지 만들기 v2
          </h1>
          <ApiKeySettings onApiKeyChange={setApiKey} />
        </div>
      </header>

      {/* 진행 상태 표시 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {["upload", "analyze", "generate", "edit"].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s 
                    ? "bg-blue-600 text-white" 
                    : ["upload", "analyze", "generate", "edit"].indexOf(step) > idx
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}>
                  {["upload", "analyze", "generate", "edit"].indexOf(step) > idx ? "✓" : idx + 1}
                </div>
                <span className={`ml-2 text-sm ${step === s ? "text-blue-600 font-bold" : "text-gray-500"}`}>
                  {s === "upload" && "사진 업로드"}
                  {s === "analyze" && "AI 분석"}
                  {s === "generate" && "생성"}
                  {s === "edit" && "편집"}
                </span>
                {idx < 3 && <div className="w-12 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* STEP 1: 이미지 업로드 */}
        {(step === "upload" || !uploadedImage) && (
          <div className="max-w-xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                제품 사진을 업로드하세요
              </h2>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                사진 한 장만 올리면 AI가 자동으로 상세페이지를 만들어드립니다
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
              >
                {uploadedImage ? (
                  <div className="relative w-48 h-48 mx-auto">
                    <Image
                      src={uploadedImage.preview}
                      alt="업로드된 이미지"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <>
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">클릭하여 이미지 선택</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {uploadedImage && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full mt-6 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      AI가 분석 중...
                    </>
                  ) : (
                    "AI로 분석하기"
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: 분석 결과 */}
        {step === "analyze" && analysis && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 업로드된 이미지 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">업로드된 제품</h3>
              {uploadedImage && (
                <div className="relative aspect-square w-full max-w-sm mx-auto">
                  <Image
                    src={uploadedImage.preview}
                    alt="제품 이미지"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* 분석 결과 수정 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                AI 분석 결과
                <span className="text-sm font-normal text-gray-500 ml-2">(수정 가능)</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">브랜드</label>
                    <input
                      type="text"
                      value={analysis.brand}
                      onChange={(e) => handleAnalysisChange("brand", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">제품명</label>
                    <input
                      type="text"
                      value={analysis.productName}
                      onChange={(e) => handleAnalysisChange("productName", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">카테고리</label>
                    <select
                      value={analysis.category}
                      onChange={(e) => handleAnalysisChange("category", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="skincare">스킨케어/화장품</option>
                      <option value="food">식품/건강식품</option>
                      <option value="electronics">전자제품</option>
                      <option value="fashion">패션/의류</option>
                      <option value="household">생활용품</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">브랜드 톤</label>
                    <select
                      value={analysis.brandTone}
                      onChange={(e) => handleAnalysisChange("brandTone", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="luxury">럭셔리</option>
                      <option value="natural">내추럴</option>
                      <option value="modern">모던</option>
                      <option value="playful">플레이풀</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">핵심 특징 (3가지)</label>
                  <div className="space-y-2">
                    {analysis.keyFeatures.map((feature, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...analysis.keyFeatures];
                          newFeatures[idx] = e.target.value;
                          handleAnalysisChange("keyFeatures", newFeatures);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">주요 효능 (3가지)</label>
                  <div className="space-y-2">
                    {analysis.targetBenefits.map((benefit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...analysis.targetBenefits];
                          newBenefits[idx] = e.target.value;
                          handleAnalysisChange("targetBenefits", newBenefits);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* 컬러 프리뷰 */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">추출된 컬러</label>
                  <div className="flex gap-2">
                    {analysis.mainColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-lg border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {progress || "생성 중..."}
                  </>
                ) : (
                  "상세페이지 생성하기"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3-4: 생성 및 편집 */}
        {(step === "generate" || step === "edit") && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 왼쪽: 섹션 목록 (블록 에디터) */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">섹션 구성</h3>
                <div className="space-y-2">
                  {generatedSections.map((section) => (
                    <div
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedSectionId === section.id
                          ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="text-gray-400">☰</span>
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{section.nameKo}</span>
                      {section.imageUrl && <span className="text-green-500">✓</span>}
                      {section.isGenerating && (
                        <svg className="animate-spin w-4 h-4 text-blue-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 text-sm">
                  + 섹션 추가
                </button>
              </div>
            </div>

            {/* 오른쪽: 미리보기 */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">미리보기</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={renderAllSections}
                      disabled={isRendering || !generatedCopy}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isRendering ? "렌더링 중..." : "템플릿 적용"}
                    </button>
                    <button 
                      onClick={handleDownloadAll}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      전체 다운로드
                    </button>
                  </div>
                </div>

                {/* 미리보기 영역 */}
                <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 min-h-[600px] max-h-[800px] overflow-y-auto">
                  <div className="max-w-[400px] mx-auto space-y-4">
                    {/* 모든 섹션 이미지 표시 */}
                    {generatedSections.map((section) => {
                      // 렌더링된 이미지 우선, 없으면 AI 생성 이미지
                      const displayImage = renderedImages[section.name] || section.imageUrl;
                      const isRendered = !!renderedImages[section.name];
                      
                      return (
                        <div 
                          key={section.id}
                          id={`section-${section.id}`}
                          className={`relative transition-all ${
                            selectedSectionId === section.id ? "ring-4 ring-blue-500 rounded-lg" : ""
                          }`}
                        >
                          {displayImage ? (
                            <div className="relative">
                              <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                {section.nameKo}
                                {isRendered && <span className="text-green-400">✓</span>}
                              </div>
                              <button
                                onClick={() => handleDownloadSingle({ ...section, imageUrl: displayImage })}
                                className="absolute top-2 right-2 z-10 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
                              >
                                다운로드
                              </button>
                              <div className="relative bg-white rounded-lg overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={displayImage}
                                  alt={section.nameKo}
                                  className="w-full h-auto"
                                />
                              </div>
                            </div>
                          ) : section.isGenerating ? (
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center">
                              <svg className="animate-spin w-8 h-8 text-blue-500 mb-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              <p className="text-sm text-gray-500">{section.nameKo} 생성 중...</p>
                            </div>
                          ) : (
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <p className="text-sm text-gray-400">{section.nameKo} - 대기 중</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* 생성된 카피 미리보기 */}
                    {generatedCopy && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-xs text-gray-500 mb-2">생성된 카피라이팅</div>
                        <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                          {generatedCopy}
                        </pre>
                      </div>
                    )}

                    {/* 로딩 상태 (전체) */}
                    {isGenerating && generatedSections.every(s => !s.imageUrl) && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <svg className="animate-spin w-12 h-12 text-blue-600 mb-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-gray-500">{progress}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {analysisError && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {analysisError}
          </div>
        )}
        
        {/* 렌더링 중 표시 */}
        {isRendering && (
          <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {progress || "템플릿 렌더링 중..."}
          </div>
        )}
      </div>
      
      {/* 숨겨진 템플릿 렌더링 영역 - 이미지 캡처용 */}
      {analysis && step === "edit" && (
        <div 
          style={{ 
            position: "fixed", 
            left: "-9999px", 
            top: 0,
            width: "800px",
            backgroundColor: "#ffffff",
          }}
          aria-hidden="true"
        >
          {/* 히어로 섹션 */}
          <HeroSection
            ref={heroRef}
            productName={analysis.productName}
            brand={analysis.brand}
            headline={parseCopyText(generatedCopy).headline || `${analysis.productName}의 특별함`}
            subheadline={parseCopyText(generatedCopy).subheadline || analysis.keyFeatures[0] || ""}
            category={analysis.category}
            backgroundImage={generatedSections.find(s => s.name === "hero")?.imageUrl}
          />
          
          {/* 베네핏 섹션 */}
          <BenefitsSection
            ref={benefitsRef}
            benefits={parseCopyText(generatedCopy).benefits.length > 0 
              ? parseCopyText(generatedCopy).benefits 
              : analysis.targetBenefits.slice(0, 3)}
            category={analysis.category}
            backgroundImage={generatedSections.find(s => s.name === "benefits")?.imageUrl}
          />
          
          {/* 연출컷 섹션 */}
          <ProductShotSection
            ref={productShotRef}
            productName={analysis.productName}
            tagline={analysis.keyFeatures[0] || "당신을 위한 특별한 제품"}
            category={analysis.category}
            productImage={generatedSections.find(s => s.name === "product_shot")?.imageUrl || uploadedImage?.preview || null}
          />
          
          {/* 사용법 섹션 */}
          <HowToUseSection
            ref={howToUseRef}
            steps={parseCopyText(generatedCopy).steps}
            category={analysis.category}
            backgroundImage={generatedSections.find(s => s.name === "how_to_use")?.imageUrl}
          />
          
          {/* CTA 섹션 */}
          <CTASection
            ref={ctaRef}
            productName={analysis.productName}
            ctaText="지금 바로 경험해보세요"
            category={analysis.category}
            backgroundImage={generatedSections.find(s => s.name === "cta")?.imageUrl}
          />
        </div>
      )}
    </main>
  );
}
