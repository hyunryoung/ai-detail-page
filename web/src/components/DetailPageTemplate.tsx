"use client";

import { forwardRef } from "react";

interface DetailPageTemplateProps {
  productName: string;
  productImage: string | null;
  generatedImage: string | null;
  copyText: string;
}

// 상세페이지 템플릿 컴포넌트 (렌더링용)
// html2canvas 호환성을 위해 인라인 스타일 사용 (Tailwind의 lab() 색상 미지원)
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

    // 색상 정의 (html2canvas 호환 - hex/rgb만 사용)
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

    return (
      <div 
        ref={ref}
        data-template="true"
        style={{ 
          width: "800px", 
          backgroundColor: colors.white, 
          color: colors.gray900,
          fontFamily: "'Noto Sans KR', sans-serif"
        }}
      >
        {/* 헤더 영역 */}
        <div style={{
          background: `linear-gradient(to bottom right, ${colors.blue600}, ${colors.purple600})`,
          color: colors.white,
          padding: "48px",
          textAlign: "center"
        }}>
          <h1 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>
            {headline}
          </h1>
          {subheadline && (
            <p style={{ fontSize: "20px", opacity: 0.9 }}>{subheadline}</p>
          )}
        </div>

        {/* 메인 이미지 */}
        <div style={{
          position: "relative",
          width: "100%",
          paddingBottom: "100%", // 1:1 비율
          backgroundColor: colors.gray100,
          overflow: "hidden"
        }}>
          {(generatedImage || productImage) && (
            <img
              src={generatedImage || productImage || ""}
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
          )}
          {!generatedImage && !productImage && (
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

        {/* 제품 특징 */}
        {features.length > 0 && (
          <div style={{ padding: "48px", backgroundColor: colors.gray50 }}>
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
        )}

        {/* 추천 대상 */}
        {recommendations.length > 0 && (
          <div style={{ padding: "48px" }}>
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
        )}

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
    );
  }
);

DetailPageTemplate.displayName = "DetailPageTemplate";

export default DetailPageTemplate;
