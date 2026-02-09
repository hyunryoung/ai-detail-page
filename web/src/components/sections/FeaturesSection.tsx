"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  englishTitle: string;
  headline: string;
  description: string;
  badges: Array<{ label: string }>;
  category: string;
  productImage?: string | null;
}

export const FeaturesSection = forwardRef<HTMLDivElement, Props>(
  ({ englishTitle, headline, description, badges, category, productImage }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="features" style={{ ...commonStyles.sectionBase, background: theme.bg }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "18px", fontStyle: "italic", color: theme.primary, marginBottom: "12px", fontWeight: "500" }}>
            {englishTitle}
          </p>
          <h2 style={{ ...commonStyles.h1, color: theme.text, whiteSpace: "pre-line", marginBottom: "24px" }}>
            {headline}
          </h2>
          <div style={{ width: "1px", height: "40px", background: theme.primary, margin: "0 auto 24px" }} />
          <p style={{ ...commonStyles.body, color: theme.textLight, maxWidth: "560px", margin: "0 auto" }}>
            {description}
          </p>
        </div>

        {/* 6개 배지 그리드 */}
        <div style={{ padding: "32px 60px 20px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}>
            {badges.slice(0, 6).map((badge, i) => (
              <div key={i} style={{
                padding: "20px 24px",
                border: `1.5px solid ${theme.border}`,
                borderRadius: "8px",
                textAlign: "center",
                background: theme.bg,
              }}>
                <span style={{ fontSize: "16px", fontWeight: "600", color: theme.text }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 제품 이미지 (앞/뒤) */}
        {productImage && (
          <div style={{ padding: "20px 60px 60px", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImage} alt="product" style={{ width: "200px", height: "auto", objectFit: "contain" }} />
            </div>
          </div>
        )}
      </div>
    );
  }
);
FeaturesSection.displayName = "FeaturesSection";
