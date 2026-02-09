"use client";

import { forwardRef } from "react";

// base64 data URL인지 확인하는 헬퍼 함수
// 외부 URL은 html-to-image에서 CORS/인코딩 문제가 발생하므로 사용하지 않음
const isValidBackgroundImage = (url: string | null | undefined): boolean => {
  if (!url) return false;
  // base64 data URL만 허용
  return url.startsWith("data:");
};

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

// 1. 히어로 섹션 - 제품 첫인상 (AI가 제품 유지 + 배경 교체)
export const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ productName, brand, headline, subheadline, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    const hasValidBg = isValidBackgroundImage(backgroundImage);
    
    return (
      <div
        ref={ref}
        data-section="hero"
        style={{
          width: "860px",
          minHeight: "600px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* AI 생성 이미지 (제품 포함) 또는 그라데이션 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: hasValidBg 
              ? `url(${backgroundImage}) center/cover`
              : palette.gradient,
          }}
        />
        
        {/* 오버레이 (텍스트 가독성) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: hasValidBg 
              ? "rgba(0,0,0,0.3)"
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
            color: hasValidBg ? "#ffffff" : palette.text,
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
              background: hasValidBg ? "#ffffff" : palette.primary,
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
    const hasValidBg = isValidBackgroundImage(backgroundImage);
    
    return (
      <div
        ref={ref}
        data-section="benefits"
        style={{
          width: "860px",
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
            background: hasValidBg 
              ? `url(${backgroundImage}) center/cover`
              : palette.background,
          }}
        />
        
        {hasValidBg && (
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
  backgroundImage?: string | null; // AI 생성 이미지 (제품 포함)
}

// 3. 연출컷 섹션 - AI가 제품 유지 + 배경 교체
export const ProductShotSection = forwardRef<HTMLDivElement, ProductShotSectionProps>(
  ({ productName, tagline, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    const hasValidBg = isValidBackgroundImage(backgroundImage);
    
    return (
      <div
        ref={ref}
        data-section="product_shot"
        style={{
          width: "860px",
          minHeight: "800px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* AI 생성 이미지 (제품 포함) 또는 그라데이션 */}
        <div
          style={{
            width: "100%",
            height: "600px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: hasValidBg
                ? `url(${backgroundImage}) center/cover`
                : palette.gradient,
            }}
          />
          
          {/* AI 이미지가 없을 때 플레이스홀더 */}
          {!hasValidBg && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: palette.text,
                fontSize: "18px",
                textAlign: "center",
              }}
            >
              AI 이미지 생성 중...
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
    const hasValidBg = isValidBackgroundImage(backgroundImage);
    
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
          width: "860px",
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
            background: hasValidBg 
              ? `url(${backgroundImage}) center/cover`
              : palette.gradient,
          }}
        />
        
        {hasValidBg && (
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
    const hasValidBg = isValidBackgroundImage(backgroundImage);
    
    return (
      <div
        ref={ref}
        data-section="cta"
        style={{
          width: "860px",
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
            background: hasValidBg 
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
            background: hasValidBg 
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

// ===== 추가 섹션들 =====

interface ProblemSectionProps {
  problems: string[];
  category: Category;
}

// 6. 문제 공감 섹션 - 고객의 고민
export const ProblemSection = forwardRef<HTMLDivElement, ProblemSectionProps>(
  ({ problems, category }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    const defaultProblems = [
      "매일 아침 거울을 보며 한숨을 쉬셨나요?",
      "다양한 제품을 써봤지만 효과가 없으셨나요?",
      "민감한 피부 때문에 고민이셨나요?",
    ];
    
    const displayProblems = problems.length > 0 ? problems : defaultProblems;
    
    return (
      <div
        ref={ref}
        data-section="problem"
        style={{
          width: "860px",
          minHeight: "500px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          background: "#f8f9fa",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Your Concerns
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              이런 고민 있으셨나요?
            </h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {displayProblems.slice(0, 3).map((problem, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  padding: "32px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: `${palette.primary}20`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  😔
                </div>
                <p
                  style={{
                    fontSize: "18px",
                    color: palette.text,
                    lineHeight: 1.6,
                    flex: 1,
                  }}
                >
                  {problem}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
ProblemSection.displayName = "ProblemSection";

interface IngredientsSectionProps {
  ingredients: { name: string; description: string }[];
  category: Category;
  backgroundImage?: string | null;
}

// 7. 핵심 성분 섹션
export const IngredientsSection = forwardRef<HTMLDivElement, IngredientsSectionProps>(
  ({ ingredients, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    const hasValidBg = isValidBackgroundImage(backgroundImage);
    
    const defaultIngredients = [
      { name: "히알루론산", description: "깊은 보습과 수분 유지" },
      { name: "비타민 C", description: "피부 톤 개선과 광채 부여" },
      { name: "나이아신아마이드", description: "피부 장벽 강화" },
    ];
    
    const displayIngredients = ingredients.length > 0 ? ingredients : defaultIngredients;
    
    return (
      <div
        ref={ref}
        data-section="ingredients"
        style={{
          width: "860px",
          minHeight: "600px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: hasValidBg 
              ? `url(${backgroundImage}) center/cover`
              : palette.gradient,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: hasValidBg ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.95)",
          }}
        />
        
        <div style={{ position: "relative", zIndex: 10, padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Key Ingredients
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              핵심 성분
            </h2>
          </div>
          
          <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
            {displayIngredients.slice(0, 3).map((ingredient, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  maxWidth: "250px",
                  background: "#ffffff",
                  padding: "32px 24px",
                  borderRadius: "16px",
                  textAlign: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  border: `2px solid ${palette.primary}20`,
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 20px",
                    background: palette.gradient,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                  }}
                >
                  {["🧪", "✨", "💧"][idx % 3]}
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: palette.text,
                    marginBottom: "12px",
                  }}
                >
                  {ingredient.name}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666666",
                    lineHeight: 1.6,
                  }}
                >
                  {ingredient.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
IngredientsSection.displayName = "IngredientsSection";

interface BeforeAfterSectionProps {
  title: string;
  description: string;
  category: Category;
}

// 8. 효과 비교 섹션 (Before/After)
export const BeforeAfterSection = forwardRef<HTMLDivElement, BeforeAfterSectionProps>(
  ({ title, description, category }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    return (
      <div
        ref={ref}
        data-section="before_after"
        style={{
          width: "860px",
          minHeight: "500px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Transformation
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              {title || "눈에 보이는 변화"}
            </h2>
          </div>
          
          <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
            {/* Before */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: "280px",
                  background: "#e9ecef",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "48px", opacity: 0.5 }}>😔</span>
              </div>
              <p style={{ fontSize: "18px", fontWeight: "600", color: "#666666" }}>
                BEFORE
              </p>
              <p style={{ fontSize: "14px", color: "#999999", marginTop: "8px" }}>
                사용 전
              </p>
            </div>
            
            {/* Arrow */}
            <div
              style={{
                width: "60px",
                height: "60px",
                background: palette.primary,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              →
            </div>
            
            {/* After */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  width: "100%",
                  height: "280px",
                  background: palette.gradient,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ fontSize: "48px" }}>✨</span>
              </div>
              <p style={{ fontSize: "18px", fontWeight: "600", color: palette.primary }}>
                AFTER
              </p>
              <p style={{ fontSize: "14px", color: "#666666", marginTop: "8px" }}>
                사용 후
              </p>
            </div>
          </div>
          
          <p
            style={{
              textAlign: "center",
              marginTop: "32px",
              fontSize: "16px",
              color: "#666666",
              lineHeight: 1.6,
            }}
          >
            {description || "꾸준한 사용으로 눈에 띄는 변화를 경험하세요"}
          </p>
        </div>
      </div>
    );
  }
);
BeforeAfterSection.displayName = "BeforeAfterSection";

interface CertificationSectionProps {
  certifications: string[];
  category: Category;
}

// 9. 인증/데이터 섹션
export const CertificationSection = forwardRef<HTMLDivElement, CertificationSectionProps>(
  ({ certifications, category }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    const defaultCerts = [
      "피부 자극 테스트 완료",
      "피부과 전문의 테스트 완료",
      "무향료 / 무파라벤",
      "비건 인증",
    ];
    
    const displayCerts = certifications.length > 0 ? certifications : defaultCerts;
    
    return (
      <div
        ref={ref}
        data-section="certification"
        style={{
          width: "860px",
          minHeight: "400px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          background: palette.background,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Certification
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              안심할 수 있는 이유
            </h2>
          </div>
          
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            {displayCerts.slice(0, 4).map((cert, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  padding: "24px 32px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: palette.primary,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "20px",
                  }}
                >
                  ✓
                </div>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: palette.text,
                  }}
                >
                  {cert}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
CertificationSection.displayName = "CertificationSection";

interface ReviewsSectionProps {
  reviews: { name: string; rating: number; text: string }[];
  category: Category;
}

// 10. 고객 후기 섹션
export const ReviewsSection = forwardRef<HTMLDivElement, ReviewsSectionProps>(
  ({ reviews, category }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    const defaultReviews = [
      { name: "김**", rating: 5, text: "피부가 정말 좋아졌어요! 꾸준히 사용하고 있습니다." },
      { name: "이**", rating: 5, text: "순하면서도 효과가 좋아서 만족합니다." },
      { name: "박**", rating: 4, text: "향도 좋고 발림성이 뛰어나요." },
    ];
    
    const displayReviews = reviews.length > 0 ? reviews : defaultReviews;
    
    return (
      <div
        ref={ref}
        data-section="reviews"
        style={{
          width: "860px",
          minHeight: "500px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Reviews
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              고객 후기
            </h2>
            <p style={{ fontSize: "16px", color: "#666666", marginTop: "12px" }}>
              실제 사용자들의 생생한 후기
            </p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {displayReviews.slice(0, 3).map((review, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8f9fa",
                  padding: "28px 32px",
                  borderRadius: "16px",
                  borderLeft: `4px solid ${palette.primary}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontWeight: "600", color: palette.text }}>{review.name}</span>
                  <span style={{ color: "#ffc107", fontSize: "16px" }}>
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p style={{ fontSize: "15px", color: "#555555", lineHeight: 1.7 }}>
                  "{review.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
ReviewsSection.displayName = "ReviewsSection";

interface FAQSectionProps {
  faqs: { question: string; answer: string }[];
  category: Category;
}

// 11. FAQ 섹션
export const FAQSection = forwardRef<HTMLDivElement, FAQSectionProps>(
  ({ faqs, category }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    const defaultFaqs = [
      { question: "민감한 피부도 사용할 수 있나요?", answer: "네, 저자극 테스트를 완료하여 민감한 피부에도 안심하고 사용하실 수 있습니다." },
      { question: "얼마나 사용해야 효과를 볼 수 있나요?", answer: "개인차가 있지만, 보통 2-4주 정도 꾸준히 사용하시면 변화를 느끼실 수 있습니다." },
      { question: "다른 제품과 함께 사용해도 되나요?", answer: "네, 대부분의 스킨케어 제품과 함께 사용하실 수 있습니다." },
    ];
    
    const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;
    
    return (
      <div
        ref={ref}
        data-section="faq"
        style={{
          width: "860px",
          minHeight: "500px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          background: palette.background,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              FAQ
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              자주 묻는 질문
            </h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {displayFaqs.slice(0, 3).map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: "#ffffff",
                  padding: "24px 32px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "12px" }}>
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      background: palette.primary,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: "bold",
                      flexShrink: 0,
                    }}
                  >
                    Q
                  </span>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: palette.text }}>
                    {faq.question}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", paddingLeft: "44px" }}>
                  <p style={{ fontSize: "15px", color: "#666666", lineHeight: 1.7 }}>
                    {faq.answer}
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
FAQSection.displayName = "FAQSection";

interface SpecsSectionProps {
  productName: string;
  specs: { label: string; value: string }[];
  category: Category;
}

// 12. 제품 스펙 섹션
export const SpecsSection = forwardRef<HTMLDivElement, SpecsSectionProps>(
  ({ productName, specs, category }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    const defaultSpecs = [
      { label: "용량", value: "50ml" },
      { label: "제조국", value: "대한민국" },
      { label: "사용기한", value: "제조일로부터 30개월" },
      { label: "피부타입", value: "모든 피부" },
    ];
    
    const displaySpecs = specs.length > 0 ? specs : defaultSpecs;
    
    return (
      <div
        ref={ref}
        data-section="specs"
        style={{
          width: "860px",
          minHeight: "400px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Specifications
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              제품 정보
            </h2>
          </div>
          
          <div
            style={{
              background: "#f8f9fa",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: palette.primary,
                padding: "20px 32px",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {productName}
            </div>
            <div style={{ padding: "8px 0" }}>
              {displaySpecs.map((spec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    padding: "16px 32px",
                    borderBottom: idx < displaySpecs.length - 1 ? "1px solid #e9ecef" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "140px",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#666666",
                    }}
                  >
                    {spec.label}
                  </span>
                  <span style={{ fontSize: "15px", color: palette.text }}>
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
SpecsSection.displayName = "SpecsSection";

interface ShippingSectionProps {
  category: Category;
}

// 13. 배송/교환 안내 섹션
export const ShippingSection = forwardRef<HTMLDivElement, ShippingSectionProps>(
  ({ category }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    
    return (
      <div
        ref={ref}
        data-section="shipping"
        style={{
          width: "860px",
          minHeight: "400px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          background: "#f8f9fa",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "60px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                fontSize: "14px",
                color: palette.primary,
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Shipping & Returns
            </span>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: palette.text,
                marginTop: "12px",
              }}
            >
              배송 및 교환/반품 안내
            </h2>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
            <div
              style={{
                background: "#ffffff",
                padding: "32px",
                borderRadius: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "28px" }}>🚚</span>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: palette.text }}>배송 안내</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "3만원 이상 무료배송",
                  "평일 오후 2시 이전 결제 시 당일 출고",
                  "배송기간 1-3일 소요 (주말/공휴일 제외)",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "14px",
                      color: "#666666",
                      padding: "8px 0",
                      borderBottom: idx < 2 ? "1px solid #f0f0f0" : "none",
                    }}
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div
              style={{
                background: "#ffffff",
                padding: "32px",
                borderRadius: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "28px" }}>↩️</span>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: palette.text }}>교환/반품 안내</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "상품 수령 후 7일 이내 교환/반품 가능",
                  "단순 변심 시 왕복 배송비 고객 부담",
                  "상품 하자 시 무료 교환/반품",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: "14px",
                      color: "#666666",
                      padding: "8px 0",
                      borderBottom: idx < 2 ? "1px solid #f0f0f0" : "none",
                    }}
                  >
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
ShippingSection.displayName = "ShippingSection";

interface BrandSectionProps {
  brand: string;
  brandStory: string;
  category: Category;
  backgroundImage?: string | null;
}

// 14. 브랜드 소개 섹션
export const BrandSection = forwardRef<HTMLDivElement, BrandSectionProps>(
  ({ brand, brandStory, category, backgroundImage }, ref) => {
    const palette = colorPalettes[category] || colorPalettes.skincare;
    const hasValidBg = isValidBackgroundImage(backgroundImage);
    
    return (
      <div
        ref={ref}
        data-section="brand"
        style={{
          width: "860px",
          minHeight: "400px",
          position: "relative",
          fontFamily: "'Noto Sans KR', sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: hasValidBg 
              ? `url(${backgroundImage}) center/cover`
              : palette.gradient,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: hasValidBg ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
          }}
        />
        
        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "80px 60px",
            textAlign: "center",
            color: "#ffffff",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            About Brand
          </span>
          <h2
            style={{
              fontSize: "40px",
              fontWeight: "700",
              marginTop: "16px",
              marginBottom: "24px",
            }}
          >
            {brand}
          </h2>
          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.8,
              maxWidth: "600px",
              margin: "0 auto",
              opacity: 0.95,
            }}
          >
            {brandStory || "자연에서 찾은 아름다움, 과학으로 완성한 효능. 우리는 모든 분들의 건강한 아름다움을 위해 끊임없이 연구하고 혁신합니다."}
          </p>
        </div>
      </div>
    );
  }
);
BrandSection.displayName = "BrandSection";
