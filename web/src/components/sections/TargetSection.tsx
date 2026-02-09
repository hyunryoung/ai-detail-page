"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  subtitle: string;
  headline: string;
  description: string;
  category: string;
  productImage?: string | null;
}

export const TargetSection = forwardRef<HTMLDivElement, Props>(
  ({ subtitle, headline, description, category, productImage }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="target" style={{ ...commonStyles.sectionBase, background: theme.primaryLight }}>
        {/* 텍스트 영역 */}
        <div style={{ padding: "60px 60px 40px", textAlign: "center" }}>
          <p style={{ fontSize: "17px", color: theme.textLight, marginBottom: "16px" }}>
            {subtitle}
          </p>
          <h2 style={{ ...commonStyles.h1, color: theme.text, whiteSpace: "pre-line", marginBottom: "0" }}>
            {headline}
          </h2>
        </div>

        {/* 이미지 영역 */}
        <div style={{ padding: "0 40px", display: "flex", justifyContent: "center", gap: "16px" }}>
          {/* 좌측 분위기 이미지 */}
          <div style={{
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${theme.primaryDark}, ${theme.primary})`,
            opacity: 0.9,
          }} />
          {/* 중앙 제품 이미지 */}
          <div style={{
            width: "240px",
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {productImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={productImage} alt="product" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            ) : (
              <div style={{ width: "180px", height: "240px", background: theme.border, borderRadius: "12px" }} />
            )}
          </div>
          {/* 우측 분위기 이미지 */}
          <div style={{
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.primary})`,
            opacity: 0.9,
          }} />
        </div>

        {/* 설명 */}
        <div style={{ padding: "40px 80px 60px", textAlign: "center" }}>
          <p style={{ ...commonStyles.body, color: theme.textLight, lineHeight: "1.8" }}>
            {description}
          </p>
        </div>
      </div>
    );
  }
);
TargetSection.displayName = "TargetSection";
