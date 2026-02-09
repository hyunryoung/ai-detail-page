"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  description: string;
  items: Array<{ label: string }>;
  category: string;
}

// 인증 아이콘들
const certIcons = [
  <svg key="shield" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 4L6 10v10c0 9.3 6 17.5 14 20 8-2.5 14-10.7 14-20V10L20 4z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M15 20l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="search" width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="18" cy="18" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M26 26l8 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>,
  <svg key="leaf" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M8 32c0-16 8-24 24-24 0 16-8 24-24 24z" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 32C16 24 24 16 32 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  <svg key="heart" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M20 34s-12-8-12-18c0-5 4-9 8-9 2.5 0 4 1.5 4 1.5s1.5-1.5 4-1.5c4 0 8 4 8 9 0 10-12 18-12 18z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>,
  <svg key="check" width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="lab" width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M16 6v14l-8 12c-1 1.5 0 4 2 4h20c2 0 3-2.5 2-4L24 20V6" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M14 6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
];

export const CertificationSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, description, items, category }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="certification" style={{ ...commonStyles.sectionBase, background: theme.bgDark, color: "#FFFFFF" }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 16px", textAlign: "center" }}>
          <h2 style={{ ...commonStyles.h2, color: "#FFFFFF", marginBottom: "12px" }}>
            {headline}
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: "1.7" }}>
            {description}
          </p>
        </div>

        {/* 6개 인증 그리드 */}
        <div style={{ padding: "24px 60px 60px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "rgba(255,255,255,0.1)",
          }}>
            {items.slice(0, 6).map((item, i) => (
              <div key={i} style={{
                padding: "32px 24px",
                background: theme.bgDark,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{ color: "rgba(255,255,255,0.8)" }}>
                  {certIcons[i % certIcons.length]}
                </div>
                <span style={{ fontSize: "15px", fontWeight: "600", color: "#FFFFFF" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
CertificationSection.displayName = "CertificationSection";
