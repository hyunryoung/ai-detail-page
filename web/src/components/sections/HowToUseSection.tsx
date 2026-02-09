"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  steps: Array<{ title: string; description: string }>;
  category: string;
  productImage?: string | null;
}

export const HowToUseSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, steps, category, productImage }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="howToUse" style={{ ...commonStyles.sectionBase, background: theme.bgDark, color: "#FFFFFF" }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 10px", textAlign: "center" }}>
          <p style={{ ...commonStyles.label, color: "rgba(255,255,255,0.6)", marginBottom: "12px" }}>
            How to Use
          </p>
          <h2 style={{ ...commonStyles.h1, color: "#FFFFFF", marginBottom: "40px" }}>
            {headline}
          </h2>
        </div>

        {/* 스텝들 - 교차 레이아웃 */}
        <div style={{ padding: "0 0 60px" }}>
          {steps.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <div key={i} style={{
                display: "flex",
                flexDirection: isEven ? "row" : "row-reverse",
                minHeight: "200px",
              }}>
                {/* 이미지 영역 */}
                <div style={{
                  width: "50%",
                  background: i === 0 && productImage
                    ? `url(${productImage}) center/cover`
                    : `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "200px",
                }}>
                  {!(i === 0 && productImage) && (
                    <div style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "32px", opacity: 0.5 }}>
                        {i === 0 ? "💊" : i === 1 ? "💧" : "📦"}
                      </span>
                    </div>
                  )}
                </div>

                {/* 텍스트 영역 */}
                <div style={{
                  width: "50%",
                  padding: "40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background: isEven ? "rgba(255,255,255,0.03)" : "transparent",
                }}>
                  <div style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "4px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: "16px",
                    alignSelf: "flex-start",
                  }}>
                    Step {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#FFFFFF", marginBottom: "12px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: "1.7" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
HowToUseSection.displayName = "HowToUseSection";
