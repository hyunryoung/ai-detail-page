"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  backgroundImage?: string | null;
  productImage?: string | null;
}

export const BrandStorySection = forwardRef<HTMLDivElement, Props>(
  ({ title, subtitle, description, category, backgroundImage, productImage }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="brandStory" style={{ ...commonStyles.sectionBase }}>
        {/* 이미지 영역 */}
        <div style={{
          height: "420px",
          position: "relative",
          background: backgroundImage
            ? `url(${backgroundImage}) center/cover`
            : `linear-gradient(135deg, ${theme.bgDark}, ${theme.primaryDark})`,
          overflow: "hidden",
        }}>
          {/* 오버레이 */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
          {productImage && !backgroundImage && (
            <div style={{ position: "absolute", right: "40px", bottom: "20px", opacity: 0.6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImage} alt="" style={{ width: "150px", height: "auto" }} />
            </div>
          )}
        </div>

        {/* 텍스트 카드 (이미지 위에 겹침) */}
        <div style={{
          margin: "-80px 60px 0",
          padding: "40px 48px",
          background: theme.bg,
          position: "relative",
          zIndex: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: "600", color: theme.textLight, marginBottom: "4px" }}>
            {title}
          </h2>
          <h3 style={{ ...commonStyles.h1, color: theme.primaryDark, marginBottom: "24px" }}>
            {subtitle}
          </h3>
          <p style={{ ...commonStyles.body, color: theme.textLight, lineHeight: "1.8" }}>
            {description}
          </p>
        </div>

        {/* 하단 여백 */}
        <div style={{ height: "60px", background: theme.bg }} />
      </div>
    );
  }
);
BrandStorySection.displayName = "BrandStorySection";
