"use client";

import { forwardRef } from "react";

// 공통 색상 정의
const colors = {
  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  blue600: "#2563eb",
  purple600: "#9333ea",
};

// 공통 Props
interface SectionProps {
  productName: string;
  copyText: string;
  productImage?: string | null;
  generatedImage?: string | null;
}

// 1. 헤더 섹션
export const HeaderSection = forwardRef<HTMLDivElement, { headline: string; subheadline?: string }>(
  ({ headline, subheadline }, ref) => (
    <div 
      ref={ref}
      data-section="header"
      style={{ 
        width: "800px", 
        background: `linear-gradient(to bottom right, ${colors.blue600}, ${colors.purple600})`,
        color: colors.white,
        padding: "48px",
        textAlign: "center",
        fontFamily: "'Noto Sans KR', sans-serif"
      }}
    >
      <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>
        {headline}
      </h1>
      {subheadline && (
        <p style={{ fontSize: "20px", opacity: 0.9 }}>{subheadline}</p>
      )}
    </div>
  )
);
HeaderSection.displayName = "HeaderSection";

// 2. 메인 이미지 섹션
export const MainImageSection = forwardRef<HTMLDivElement, { productName: string; imageUrl: string | null }>(
  ({ productName, imageUrl }, ref) => (
    <div 
      ref={ref}
      data-section="main-image"
      style={{ 
        width: "800px", 
        fontFamily: "'Noto Sans KR', sans-serif"
      }}
    >
      <div style={{
        position: "relative",
        width: "100%",
        paddingBottom: "100%", // 1:1 비율
        backgroundColor: colors.gray100,
        overflow: "hidden"
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.gray400
          }}>
            이미지 없음
          </div>
        )}
      </div>
    </div>
  )
);
MainImageSection.displayName = "MainImageSection";

// 3. 제품 특징 섹션
export const FeaturesSection = forwardRef<HTMLDivElement, { features: string[] }>(
  ({ features }, ref) => {
    if (features.length === 0) return null;
    
    return (
      <div 
        ref={ref}
        data-section="features"
        style={{ 
          width: "800px", 
          padding: "48px", 
          backgroundColor: colors.gray50,
          fontFamily: "'Noto Sans KR', sans-serif"
        }}
      >
        <h2 style={{ 
          fontSize: "24px", 
          fontWeight: "bold", 
          textAlign: "center", 
          marginBottom: "32px",
          color: colors.gray800
        }}>
          주요 특징
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              backgroundColor: colors.white,
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                backgroundColor: colors.blue600,
                color: colors.white,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontWeight: "bold"
              }}>
                {idx + 1}
              </div>
              <p style={{ fontSize: "18px", color: colors.gray700, paddingTop: "4px" }}>
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
FeaturesSection.displayName = "FeaturesSection";

// 4. 추천 대상 섹션
export const RecommendationsSection = forwardRef<HTMLDivElement, { recommendations: string[] }>(
  ({ recommendations }, ref) => {
    if (recommendations.length === 0) return null;
    
    return (
      <div 
        ref={ref}
        data-section="recommendations"
        style={{ 
          width: "800px", 
          padding: "48px",
          backgroundColor: colors.white,
          fontFamily: "'Noto Sans KR', sans-serif"
        }}
      >
        <h2 style={{ 
          fontSize: "24px", 
          fontWeight: "bold", 
          textAlign: "center", 
          marginBottom: "32px",
          color: colors.gray800
        }}>
          이런 분께 추천해요
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {recommendations.map((rec, idx) => (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              border: `1px solid ${colors.gray200}`,
              borderRadius: "8px"
            }}>
              <span style={{ fontSize: "24px" }}>✨</span>
              <p style={{ fontSize: "18px", color: colors.gray700 }}>{rec}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
RecommendationsSection.displayName = "RecommendationsSection";

// 5. 배송 안내 + 푸터 섹션
export const FooterSection = forwardRef<HTMLDivElement, {}>(
  (props, ref) => (
    <div 
      ref={ref}
      data-section="footer"
      style={{ 
        width: "800px",
        fontFamily: "'Noto Sans KR', sans-serif"
      }}
    >
      {/* 배송 안내 */}
      <div style={{
        padding: "48px",
        backgroundColor: colors.gray800,
        color: colors.white,
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
          배송 안내
        </h2>
        <div style={{ color: colors.gray300 }}>
          <p style={{ marginBottom: "8px" }}>주문 후 1-3일 내 출고</p>
          <p>안전한 포장으로 배송해드립니다</p>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        padding: "24px",
        backgroundColor: colors.gray900,
        textAlign: "center",
        color: colors.gray500,
        fontSize: "14px"
      }}>
        <p>AI 상세페이지 자동화 시스템으로 제작됨</p>
      </div>
    </div>
  )
);
FooterSection.displayName = "FooterSection";

// 텍스트 파싱 유틸리티
export function parseCopyText(copyText: string) {
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
  const headline = lines[0]?.replace(/^[#\d.]+\s*/, "").replace(/^\*+|\*+$/g, "").trim() || "";
  const subheadline = lines[1]?.replace(/^[#\d.]+\s*/, "").replace(/^\*+|\*+$/g, "").trim() || "";

  return {
    headline,
    subheadline,
    features,
    recommendations
  };
}
