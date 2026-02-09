"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  description: string;
  items: Array<{ question: string; answer: string }>;
  category: string;
}

export const FAQSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, description, items, category }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="faq" style={{ ...commonStyles.sectionBase, background: theme.bg }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 10px" }}>
          <h2 style={{ ...commonStyles.h1, color: theme.text, marginBottom: "12px" }}>
            {headline}
          </h2>
          <p style={{ ...commonStyles.body, color: theme.textLight, marginBottom: "40px" }}>
            {description}
          </p>
        </div>

        {/* Q&A 리스트 */}
        <div style={{ padding: "0 60px 60px" }}>
          {items.map((item, i) => (
            <div key={i} style={{
              padding: "28px 0",
              borderBottom: i < items.length - 1 ? `1px solid ${theme.border}` : "none",
            }}>
              <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
                <span style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: theme.primary,
                  lineHeight: "1",
                  minWidth: "50px",
                }}>
                  Q{i + 1}
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: theme.text, lineHeight: "1.4" }}>
                  {item.question}
                </h3>
              </div>
              <div style={{ display: "flex", gap: "16px", paddingLeft: "0" }}>
                <div style={{ minWidth: "50px", display: "flex", justifyContent: "center" }}>
                  <span style={{ color: theme.primary, fontSize: "16px", fontWeight: "600" }}>↳</span>
                </div>
                <p style={{ fontSize: "15px", color: theme.textLight, lineHeight: "1.7" }}>
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
FAQSection.displayName = "FAQSection";
