"use client";

import { forwardRef } from "react";
import Image from "next/image";

interface DetailPageTemplateProps {
  productName: string;
  productImage: string | null;
  generatedImage: string | null;
  copyText: string;
}

// 상세페이지 템플릿 컴포넌트 (렌더링용)
const DetailPageTemplate = forwardRef<HTMLDivElement, DetailPageTemplateProps>(
  ({ productName, productImage, generatedImage, copyText }, ref) => {
    // 카피 텍스트 파싱
    const parseSection = (text: string, marker: string): string[] => {
      const lines = text.split("\n");
      const startIdx = lines.findIndex(l => l.includes(marker));
      if (startIdx === -1) return [];
      
      const items: string[] = [];
      for (let i = startIdx + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
          items.push(line.replace(/^[•\-*]\s*/, ""));
        } else if (line.length === 0) {
          continue;
        } else if (items.length > 0) {
          break;
        }
      }
      return items;
    };

    const features = parseSection(copyText, "특징");
    const recommendations = parseSection(copyText, "추천");

    // 헤드라인 추출
    const lines = copyText.split("\n").filter(l => l.trim());
    const headline = lines[0]?.replace(/^[#\d.]+\s*/, "").replace(/^\*+|\*+$/g, "").trim() || productName;
    const subheadline = lines[1]?.replace(/^[#\d.]+\s*/, "").replace(/^\*+|\*+$/g, "").trim() || "";

    return (
      <div 
        ref={ref}
        className="w-[800px] bg-white text-gray-900"
        style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
      >
        {/* 헤더 영역 */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{headline}</h1>
          {subheadline && (
            <p className="text-xl opacity-90">{subheadline}</p>
          )}
        </div>

        {/* 메인 이미지 */}
        <div className="relative aspect-square bg-gray-100">
          {generatedImage ? (
            <img
              src={generatedImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          ) : productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              이미지 없음
            </div>
          )}
        </div>

        {/* 제품 특징 */}
        {features.length > 0 && (
          <div className="p-12 bg-gray-50">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              주요 특징
            </h2>
            <div className="space-y-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-lg text-gray-700 pt-1">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 추천 대상 */}
        {recommendations.length > 0 && (
          <div className="p-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              이런 분께 추천해요
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <span className="text-2xl">✨</span>
                  <p className="text-lg text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 배송 안내 */}
        <div className="p-12 bg-gray-800 text-white text-center">
          <h2 className="text-xl font-bold mb-4">배송 안내</h2>
          <div className="space-y-2 text-gray-300">
            <p>주문 후 1-3일 내 출고</p>
            <p>안전한 포장으로 배송해드립니다</p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="p-6 bg-gray-900 text-center text-gray-500 text-sm">
          <p>AI 상세페이지 자동화 시스템으로 제작됨</p>
        </div>
      </div>
    );
  }
);

DetailPageTemplate.displayName = "DetailPageTemplate";

export default DetailPageTemplate;
