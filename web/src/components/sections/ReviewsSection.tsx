"use client";
import { forwardRef } from "react";
import { getTheme, commonStyles } from "./theme";

interface Props {
  headline: string;
  rating: number;
  reviewCount: number;
  participantCount: number;
  reviews: Array<{ author: string; date: string; content: string }>;
  category: string;
  productImage?: string | null;
}

export const ReviewsSection = forwardRef<HTMLDivElement, Props>(
  ({ headline, rating, reviewCount, participantCount, reviews, category, productImage }, ref) => {
    const theme = getTheme(category);

    return (
      <div ref={ref} data-section="reviews" style={{ ...commonStyles.sectionBase, background: theme.bgAlt }}>
        {/* 타이틀 */}
        <div style={{ padding: "60px 60px 20px", textAlign: "center" }}>
          <h2 style={{ ...commonStyles.h2, color: theme.text, marginBottom: "8px" }}>
            {headline}
          </h2>
        </div>

        {/* 별점 + 제품 이미지 */}
        <div style={{
          margin: "0 60px 30px",
          padding: "30px",
          background: theme.bg,
          borderRadius: "12px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {productImage && (
            <div style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", opacity: 0.3 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImage} alt="" style={{ width: "120px", height: "auto" }} />
            </div>
          )}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>
              {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
            </div>
            <p style={{ fontSize: "16px", color: theme.textLight }}>
              {reviewCount.toLocaleString()}개 ({participantCount.toLocaleString()}명 참여)
            </p>
          </div>
        </div>

        {/* 리뷰 카드들 */}
        <div style={{ padding: "0 60px 60px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((review, i) => (
            <div key={i} style={{
              padding: "24px 28px",
              background: theme.bg,
              borderRadius: "12px",
              border: `1px solid ${theme.border}`,
              position: "relative",
            }}>
              {/* 따옴표 장식 */}
              <div style={{
                position: "absolute",
                top: "-8px",
                left: "20px",
                width: "20px",
                height: "20px",
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderBottom: "none",
                borderRight: "none",
                transform: "rotate(45deg)",
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: theme.primaryLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" fill={theme.textLight} />
                      <path d="M4 20c0-4 3.6-7.2 8-7.2s8 3.2 8 7.2" fill={theme.textLight} />
                    </svg>
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: theme.text }}>{review.author}</span>
                </div>
                <span style={{ fontSize: "13px", color: theme.textLight }}>{review.date}</span>
              </div>
              <p style={{ fontSize: "15px", color: theme.text, lineHeight: "1.7", fontWeight: "500" }}>
                {review.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
ReviewsSection.displayName = "ReviewsSection";
