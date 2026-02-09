"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  subtitle: string;
  items: Array<{ title: string; description: string }>;
  category: string;
}

// 아이콘 SVG
const icons = [
  // 시계/시간
  <svg key="clock" width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M24 14v10l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  // 물방울/흡수
  <svg key="drop" width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 6c0 0-14 16-14 26a14 14 0 0028 0C38 22 24 6 24 6z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="24" cy="30" r="4" fill="currentColor" opacity="0.3"/></svg>,
  // 인증/메달
  <svg key="medal" width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="20" r="12" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M18 30l-3 14 9-5 9 5-3-14" stroke="currentColor" strokeWidth="2" fill="none"/><text x="24" y="24" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="bold">M</text></svg>,
];

export const ManufacturingSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, subtitle, items, category }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="manufacturing" style={{ ...commonStyles.sectionBase, background: theme.bg }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 12px", textAlign: "center" }}>
          <h2 style={{ ...commonStyles.h1, color: theme.text, marginBottom: "12px" }}>
            {headline}
          </h2>
          <p style={{ fontSize: "17px", color: theme.textLight }}>
            {subtitle}
          </p>
          <div style={{
            width: "100%",
            height: "1px",
            borderBottom: `2px dotted ${theme.border}`,
            margin: "32px 0 0",
          }} />
        </div>

        {/* 3가지 포인트 */}
        <div style={{ padding: "24px 60px 60px" }}>
          {items.slice(0, 3).map((item, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "24px",
              padding: "28px 0",
              borderBottom: i < items.length - 1 ? `1px solid ${theme.border}` : "none",
              alignItems: "flex-start",
            }}>
              {/* 아이콘 */}
              <div style={{
                minWidth: "80px",
                height: "80px",
                borderRadius: "12px",
                background: theme.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.primary,
              }}>
                {icons[i % icons.length]}
              </div>

              {/* 텍스트 */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  background: theme.text,
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: "700",
                  marginBottom: "10px",
                }}>
                  {item.title}
                </div>
                <p style={{ fontSize: "15px", color: theme.textLight, lineHeight: "1.7" }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ManufacturingSection.displayName = "ManufacturingSection";
