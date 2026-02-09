"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  productName: string;
  totalInfo: string;
  nutritionTable: Array<{ name: string; value: string; percent: string }>;
  notices: string[];
  category: string;
  productImage?: string | null;
}

export const SpecsSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, productName, totalInfo, nutritionTable, notices, category, productImage }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="specs" style={{ ...commonStyles.sectionBase, background: theme.bg }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 24px", textAlign: "center" }}>
          <p style={{ ...commonStyles.label, color: theme.primary, marginBottom: "8px" }}>
            PRODUCT SPECIFICATIONS
          </p>
          <h2 style={{ ...commonStyles.h2, color: theme.text }}>
            {headline}
          </h2>
        </div>

        {/* 스펙 테이블 + 제품 이미지 */}
        <div style={{ padding: "0 60px 20px", display: "flex", gap: "30px" }}>
          {/* 테이블 */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: theme.text, marginBottom: "12px" }}>
              {productName}
            </h3>
            <div style={{
              background: theme.primaryDark,
              color: "#FFFFFF",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "0",
            }}>
              {totalInfo}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {nutritionTable.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: "10px 16px", fontSize: "14px", fontWeight: "600", color: theme.text, width: "40%" }}>
                      {row.name}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "14px", color: theme.textLight, textAlign: "center" }}>
                      {row.value}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "14px", color: theme.textLight, textAlign: "right" }}>
                      {row.percent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 제품 이미지 */}
          {productImage && (
            <div style={{ width: "200px", display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImage} alt="" style={{ width: "100%", height: "auto", objectFit: "contain" }} />
            </div>
          )}
        </div>

        {/* 주의사항 */}
        <div style={{ padding: "16px 60px 60px" }}>
          {notices.map((notice, i) => (
            <p key={i} style={{ fontSize: "12px", color: theme.textLight, lineHeight: "1.6", marginBottom: "2px" }}>
              ▲ {notice}
            </p>
          ))}
        </div>
      </div>
    );
  }
);
SpecsSection.displayName = "SpecsSection";
