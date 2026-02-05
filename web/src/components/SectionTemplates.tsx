"use client";

import { forwardRef } from "react";

// 색상 팔레트 (카테고리별)
export const colorPalettes = {
  skincare: {
    primary: "#8B5A2B",
    secondary: "#D4A574",
    accent: "#F5E6D3",
    background: "#FDF8F3",
    text: "#2C1810",
    gradient: "linear-gradient(135deg, #F5E6D3 0%, #E8D5C4 100%)",
  },
  food: {
    primary: "#2D5016",
    secondary: "#7CB342",
    accent: "#E8F5E9",
    background: "#F1F8E9",
    text: "#1B5E20",
    gradient: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
  },
  electronics: {
    primary: "#1A237E",
    secondary: "#3F51B5",
    accent: "#E8EAF6",
    background: "#F5F5F5",
    text: "#263238",
    gradient: "linear-gradient(135deg, #1A237E 0%, #3F51B5 100%)",
  },
  fashion: {
    primary: "#880E4F",
    secondary: "#E91E63",
    accent: "#FCE4EC",
    background: "#FFF8FA",
    text: "#311B92",
    gradient: "linear-gradient(135deg, #FCE4EC 0%, #F8BBD9 100%)",
  },
  household: {
    primary: "#004D40",
    secondary: "#26A69A",
    accent: "#E0F2F1",
    background: "#F5FFFE",
    text: "#004D40",
    gradient: "linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)",
  },
};

type Category = keyof typeof colorPalettes;

interface HeroSectionProps {
  productName: string;
  brand: string;
  headline: string;
  subheadline: string;
  category: Category;
  backgroundImage?: string | null;
}

// 1. 히어로 섹션 - 제품 첫인상
export const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ productName, brand, headline, subheadline, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    return (
      <div
        ref={ref}
        data-section="hero"
        style={{
          width: "800px",
          minHeight: "600px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* 배경 이미지 또는 그라데이션 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundImage 
              ? `url(${backgroundImage}) center/cover`
              : palette.gradient,
          }}
        />
        
        {/* 오버레이 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundImage 
              ? "rgba(0,0,0,0.4)"
              : "transparent",
          }}
        />
        
        {/* 콘텐츠 */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px",
            textAlign: "center",
            color: backgroundImage ? "#ffffff" : palette.text,
          }}
        >
          {/* 브랜드 로고/이름 */}
          <div
            style={{
              fontSize: "16px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "24px",
              opacity: 0.8,
            }}
          >
            {brand}
          </div>
          
          {/* 메인 헤드라인 */}
          <h1
            style={{
              fontSize: "42px",
              fontWeight: "700",
              lineHeight: 1.3,
              marginBottom: "24px",
              maxWidth: "600px",
            }}
          >
            {headline || productName}
          </h1>
          
          {/* 서브 헤드라인 */}
          <p
            style={{
              fontSize: "20px",
              lineHeight: 1.6,
              maxWidth: "500px",
              opacity: 0.9,
            }}
          >
            {subheadline}
          </p>
          
          {/* 장식 라인 */}
          <div
            style={{
              width: "60px",
              height: "3px",
              background: backgroundImage ? "#ffffff" : palette.primary,
              marginTop: "40px",
            }}
          />
        </div>
      </div>
    );
  }
);
HeroSection.displayName = "HeroSection";

interface BenefitsSectionProps {
  benefits: string[];
  category: Category;
  backgroundImage?: string | null;
}

// 2. 베네핏 섹션 - 효능/장점
export const BenefitsSection = forwardRef<HTMLDivElement, BenefitsSectionProps>(
  ({ benefits, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    const icons = ["✨", "💎", "🌿", "⭐", "💫"];
    
    return (
      <div
        ref={ref}
        data-section="benefits"
        style={{
          width: "800px",
          minHeight: "500px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* 배경 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundImage 
              ? `url(${backgroundImage}) center/cover`
              : palette.background,
          }}
        />
        
        {backgroundImage && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.85)",
            }}
          />
        )}
        
        {/* 콘텐츠 */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "60px",
          }}
        >
          {/* 섹션 타이틀 */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Benefits
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              이런 효과가 있어요
            </h2>
          </div>
          
          {/* 베네핏 카드들 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {benefits.slice(0, 3).map((benefit, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  padding: "28px 32px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
              >
                {/* 아이콘 */}
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: palette.accent,
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    flexShrink: 0,
                  }}
                >
                  {icons[idx]}
                </div>
                
                {/* 텍스트 */}
                <div>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: palette.text,
                      lineHeight: 1.5,
                    }}
                  >
                    {benefit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
BenefitsSection.displayName = "BenefitsSection";

interface ProductShotSectionProps {
  productName: string;
  tagline: string;
  category: Category;
  productImage: string | null;
}

// 3. 연출컷 섹션 - AI 생성 이미지
export const ProductShotSection = forwardRef<HTMLDivElement, ProductShotSectionProps>(
  ({ productName, tagline, category, productImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    return (
      <div
        ref={ref}
        data-section="product_shot"
        style={{
          width: "800px",
          minHeight: "800px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
          background: palette.background,
        }}
      >
        {/* 제품 이미지 */}
        <div
          style={{
            width: "100%",
            height: "600px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: palette.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: palette.text,
                fontSize: "18px",
              }}
            >
              AI 연출컷 이미지
            </div>
          )}
        </div>
        
        {/* 캡션 영역 */}
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            background: "#ffffff",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: palette.primary,
              letterSpacing: "2px",
              marginBottom: "16px",
            }}
          >
            PRODUCT
          </p>
          <h3
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: palette.text,
              marginBottom: "16px",
            }}
          >
            {productName}
          </h3>
          <p
            style={{
              fontSize: "18px",
              color: "#666666",
              lineHeight: 1.6,
            }}
          >
            {tagline}
          </p>
        </div>
      </div>
    );
  }
);
ProductShotSection.displayName = "ProductShotSection";

interface HowToUseSectionProps {
  steps: string[];
  category: Category;
  backgroundImage?: string | null;
}

// 4. 사용법 섹션
export const HowToUseSection = forwardRef<HTMLDivElement, HowToUseSectionProps>(
  ({ steps, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    const defaultSteps = [
      "적당량을 손에 덜어주세요",
      "피부 결을 따라 부드럽게 펴 발라주세요",
      "두드리듯 흡수시켜 마무리하세요",
    ];
    
    const displaySteps = steps.length > 0 ? steps : defaultSteps;
    
    return (
      <div
        ref={ref}
        data-section="how_to_use"
        style={{
          width: "800px",
          minHeight: "500px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* 배경 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundImage 
              ? `url(${backgroundImage}) center/cover`
              : palette.gradient,
          }}
        />
        
        {backgroundImage && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.9)",
            }}
          />
        )}
        
        {/* 콘텐츠 */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "60px",
          }}
        >
          {/* 섹션 타이틀 */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              How to Use
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              사용 방법
            </h2>
          </div>
          
          {/* 스텝들 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {displaySteps.slice(0, 3).map((step, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                {/* 스텝 번호 */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    background: palette.primary,
                    color: "#ffffff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                
                {/* 스텝 설명 */}
                <div
                  style={{
                    flex: 1,
                    padding: "20px 28px",
                    background: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "18px",
                      color: palette.text,
                      lineHeight: 1.5,
                    }}
                  >
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
HowToUseSection.displayName = "HowToUseSection";

interface CTASectionProps {
  productName: string;
  ctaText: string;
  category: Category;
  backgroundImage?: string | null;
}

// 5. CTA 섹션 - 구매 유도
export const CTASection = forwardRef<HTMLDivElement, CTASectionProps>(
  ({ productName, ctaText, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    return (
      <div
        ref={ref}
        data-section="cta"
        style={{
          width: "800px",
          minHeight: "400px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* 배경 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundImage 
              ? `url(${backgroundImage}) center/cover`
              : palette.primary,
          }}
        />
        
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: backgroundImage 
              ? "rgba(0,0,0,0.5)"
              : "transparent",
          }}
        />
        
        {/* 콘텐츠 */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px",
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              marginBottom: "16px",
              opacity: 0.9,
            }}
          >
            {ctaText || "지금 바로 경험해보세요"}
          </p>
          
          <h2
            style={{
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "32px",
            }}
          >
            {productName}
          </h2>
          
          {/* CTA 버튼 (시각적 요소) */}
          <div
            style={{
              padding: "16px 48px",
              background: "#ffffff",
              color: palette.primary,
              borderRadius: "50px",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            구매하러 가기
          </div>
        </div>
      </div>
    );
  }
);
CTASection.displayName = "CTASection";
