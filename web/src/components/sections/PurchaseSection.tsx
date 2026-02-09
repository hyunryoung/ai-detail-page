"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  options: Array<{ name: string; description: string; badge: string }>;
  category: string;
  productImage?: string | null;
}

export const PurchaseSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, options, category, productImage }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="purchaseOptions" style={{ ...commonStyles.sectionBase, background: theme.bgAlt }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 12px", textAlign: "center" }}>
          <p style={{ ...commonStyles.label, color: theme.primary, marginBottom: "8px", fontStyle: "italic", letterSpacing: "1px" }}>
            Purchase Options
          </p>
          <h2 style={{ ...commonStyles.h1, color: theme.text, marginBottom: "40px" }}>
            {headline}
          </h2>
        </div>

        {/* 옵션 카드 */}
        <div style={{
          padding: "0 60px 60px",
          display: "grid",
          gridTemplateColumns: options.length > 1 ? "1fr 1fr" : "1fr",
          gap: "20px",
        }}>
          {options.map((option, i) => (
            <div key={i} style={{
              background: theme.bg,
              borderRadius: "12px",
              overflow: "hidden",
              border: `1px solid ${theme.border}`,
              textAlign: "center",
            }}>
              {/* 이미지 영역 */}
              <div style={{
                height: "200px",
                background: i === 0 ? theme.bg : theme.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}>
                {productImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={productImage} alt="" style={{ maxHeight: "160px", objectFit: "contain" }} />
                ) : (
                  <div style={{ width: "100px", height: "140px", background: theme.border, borderRadius: "8px" }} />
                )}
              </div>

              {/* 텍스트 */}
              <div style={{ padding: "24px" }}>
                <p style={{ fontSize: "14px", color: theme.textLight, marginBottom: "4px" }}>{option.description}</p>
                <h3 style={{ fontSize: "22px", fontWeight: "700", color: theme.text, marginBottom: "16px" }}>{option.name}</h3>
                <div style={{
                  display: "inline-block",
                  padding: "8px 20px",
                  background: i === 0 ? theme.primary : theme.bgDark,
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}>
                  {option.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
PurchaseSection.displayName = "PurchaseSection";
