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

// 배지 아이콘 (6개)
const badgeIcons = [
  <svg key="0" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3c-1.5 0-6 7-6 12a6 6 0 0012 0c0-5-4.5-12-6-12z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="20" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
  <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
  <svg key="5" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>,
];

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

        {/* 6개 배지 그리드 (아이콘 포함) */}
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
                borderRadius: "10px",
                background: theme.bg,
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}>
                <div style={{
                  minWidth: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: theme.primaryLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.primary,
                }}>
                  {badgeIcons[i % badgeIcons.length]}
                </div>
                <span style={{ fontSize: "15px", fontWeight: "600", color: theme.text }}>
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 제품 이미지 */}
        {productImage && (
          <div style={{ padding: "20px 60px 60px", display: "flex", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={productImage}
              alt="product"
              style={{
                width: "220px",
                height: "auto",
                objectFit: "contain",
                filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
              }}
            />
          </div>
        )}
      </div>
    );
  }
);
FeaturesSection.displayName = "FeaturesSection";
