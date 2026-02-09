"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  deliveryInfo: string;
  exchangePolicy: { possible: string[]; impossible: string[] };
  customerCenter: { brandName: string; phone: string; hours: string };
  category: string;
}

export const ShippingSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, deliveryInfo, exchangePolicy, customerCenter, category }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="shipping" style={{ ...commonStyles.sectionBase }}>
        {/* 상단: 배송/교환 정보 */}
        <div style={{ background: theme.primaryLight, padding: "60px 60px 40px" }}>
          <p style={{ ...commonStyles.label, color: theme.primary, marginBottom: "8px", fontStyle: "italic" }}>
            Delivery & CS
          </p>
          <h2 style={{ ...commonStyles.h2, color: theme.text, marginBottom: "40px" }}>
            {headline}
          </h2>

          {/* 배송 정보 */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.text, marginBottom: "8px" }}>
              배송 정보
            </h3>
            <p style={{ fontSize: "15px", color: theme.textLight, lineHeight: "1.7" }}>
              {deliveryInfo}
            </p>
          </div>

          {/* 교환/반품 */}
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: theme.text, marginBottom: "16px" }}>
              교환 및 반품
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "15px", fontWeight: "700", color: theme.text, marginBottom: "8px" }}>
                교환/반품이 가능한 경우
              </p>
              {exchangePolicy.possible.map((item, i) => (
                <p key={i} style={{ fontSize: "14px", color: theme.textLight, marginBottom: "4px", paddingLeft: "12px" }}>
                  · {item}
                </p>
              ))}
            </div>

            <div>
              <p style={{ fontSize: "15px", fontWeight: "700", color: theme.text, marginBottom: "8px" }}>
                교환/반품이 불가능한 경우
              </p>
              {exchangePolicy.impossible.map((item, i) => (
                <p key={i} style={{ fontSize: "14px", color: theme.textLight, marginBottom: "4px", paddingLeft: "12px" }}>
                  · {item}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 하단: 고객센터 */}
        <div style={{
          background: theme.bgDark,
          padding: "40px 60px",
          textAlign: "center",
          color: "#FFFFFF",
        }}>
          <h3 style={{ fontSize: "28px", fontWeight: "800", color: "#FFFFFF", marginBottom: "16px" }}>
            {customerCenter.brandName}
          </h3>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", marginBottom: "4px" }}>
            고객센터 {customerCenter.phone}
          </p>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
            상담시간 : {customerCenter.hours}
          </p>
        </div>
      </div>
    );
  }
);
ShippingSection.displayName = "ShippingSection";
