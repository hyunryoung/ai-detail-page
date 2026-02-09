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
        <div style={{ padding: "60px 60px 32px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: theme.textLight, marginBottom: "16px" }}>
            {subtitle}
          </p>
          <h2 style={{ ...commonStyles.h1, color: theme.text, whiteSpace: "pre-line", marginBottom: "0" }}>
            {headline}
          </h2>
        </div>

        {/* 제품 이미지 - 중앙 크게 */}
        <div style={{ padding: "20px 80px 24px", display: "flex", justifyContent: "center" }}>
          {productImage ? (
            <div style={{
              position: "relative",
              width: "320px",
              height: "360px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {/* 배경 장식 원 */}
              <div style={{
                position: "absolute",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}30)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={productImage}
                alt="product"
                style={{
                  position: "relative",
                  zIndex: 1,
                  maxWidth: "260px",
                  maxHeight: "340px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.12))",
                }}
              />
            </div>
          ) : (
            <div style={{ width: "200px", height: "260px", background: theme.border, borderRadius: "12px" }} />
          )}
        </div>

        {/* 설명 */}
        <div style={{ padding: "16px 80px 60px", textAlign: "center" }}>
          <p style={{ ...commonStyles.body, color: theme.textLight, lineHeight: "1.8" }}>
            {description}
          </p>
        </div>
      </div>
    );
  }
);
TargetSection.displayName = "TargetSection";
