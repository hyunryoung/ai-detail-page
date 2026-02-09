"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  englishSubtitle: string;
  headline: string;
  subheadline: string;
  description: string;
  badges: string[];
  category: string;
  productImage?: string | null;
  backgroundImage?: string | null;
  brand: string;
}

export const HeroSection = forwardRef<HTMLDivElement, Props>(
  ({ englishSubtitle, headline, subheadline, description, badges, category, productImage, backgroundImage, brand }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="hero" style={{ ...commonStyles.sectionBase, position: "relative", overflow: "hidden" }}>
        {/* 상단: 텍스트 영역 */}
        <div style={{ padding: "60px 60px 40px", textAlign: "center", background: theme.bg }}>
          <p style={{ ...commonStyles.label, color: theme.primary, marginBottom: "20px" }}>
            {englishSubtitle}
          </p>
          <h1 style={{ ...commonStyles.h1, color: theme.text, marginBottom: "16px", whiteSpace: "pre-line" }}>
            {headline}
          </h1>
          <p style={{ fontSize: "20px", fontWeight: "500", color: theme.textLight, marginBottom: "20px" }}>
            {subheadline}
          </p>
          <div style={{ width: "40px", height: "2px", background: theme.primary, margin: "20px auto" }} />
          <p style={{ ...commonStyles.body, color: theme.textLight, maxWidth: "600px", margin: "0 auto" }}>
            {description}
          </p>
        </div>

        {/* 하단: 제품 이미지 영역 */}
        <div style={{
          position: "relative",
          height: "480px",
          overflow: "hidden",
          background: backgroundImage
            ? `url(${backgroundImage}) center/cover no-repeat`
            : `linear-gradient(135deg, ${theme.bgAlt}, ${theme.primaryLight})`,
        }}>
          {/* 제품 이미지 */}
          {productImage && (
            <div style={{
              position: "absolute",
              bottom: "0",
              left: "50%",
              transform: "translateX(-50%)",
              width: "380px",
              height: "450px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImage}
                alt={brand}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}
              />
            </div>
          )}

          {/* 배지 */}
          {badges.length > 0 && (
            <div style={{
              position: "absolute",
              bottom: "30px",
              right: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}>
              {badges.map((badge, i) => (
                <div key={i} style={{
                  padding: "8px 16px",
                  background: "rgba(255,255,255,0.95)",
                  border: `1px solid ${theme.border}`,
                  borderRadius: "4px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: theme.text,
                  backdropFilter: "blur(4px)",
                }}>
                  {badge}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
HeroSection.displayName = "HeroSection";
