// 카테고리별 색상 테마
export interface ColorTheme {
  primary: string;      // 메인 브랜드 색상
  primaryDark: string;  // 진한 버전
  primaryLight: string; // 연한 배경용
  accent: string;       // 강조 색상
  text: string;         // 본문 텍스트
  textLight: string;    // 보조 텍스트
  bg: string;           // 기본 배경
  bgAlt: string;        // 대체 배경 (교차 사용)
  bgDark: string;       // 다크 섹션 배경
  border: string;       // 테두리
  cardBg: string;       // 카드 배경
}

export const themes: Record<string, ColorTheme> = {
  skincare: {
    primary: "#8B4557",
    primaryDark: "#6B2D3E",
    primaryLight: "#F8F0F2",
    accent: "#C4956A",
    text: "#2D2D2D",
    textLight: "#777777",
    bg: "#FFFFFF",
    bgAlt: "#FBF7F4",
    bgDark: "#6B2D3E",
    border: "#E8DCD0",
    cardBg: "#FFFFFF",
  },
  food: {
    primary: "#5B7A3D",
    primaryDark: "#3D5C28",
    primaryLight: "#F2F7EE",
    accent: "#D4A843",
    text: "#2D2D2D",
    textLight: "#777777",
    bg: "#FFFFFF",
    bgAlt: "#F7F5F0",
    bgDark: "#3D5C28",
    border: "#D4CFBF",
    cardBg: "#FFFFFF",
  },
  electronics: {
    primary: "#2563EB",
    primaryDark: "#1E40AF",
    primaryLight: "#EFF6FF",
    accent: "#06B6D4",
    text: "#1F2937",
    textLight: "#6B7280",
    bg: "#FFFFFF",
    bgAlt: "#F3F4F6",
    bgDark: "#111827",
    border: "#D1D5DB",
    cardBg: "#FFFFFF",
  },
  fashion: {
    primary: "#9D5C63",
    primaryDark: "#7D3C43",
    primaryLight: "#FDF2F3",
    accent: "#E8B4B8",
    text: "#2D2D2D",
    textLight: "#888888",
    bg: "#FFFFFF",
    bgAlt: "#FAF5F5",
    bgDark: "#3D2A2C",
    border: "#E8D5D7",
    cardBg: "#FFFFFF",
  },
  household: {
    primary: "#4B7BE5",
    primaryDark: "#2E5CBF",
    primaryLight: "#EEF2FF",
    accent: "#22C55E",
    text: "#1F2937",
    textLight: "#6B7280",
    bg: "#FFFFFF",
    bgAlt: "#F9FAFB",
    bgDark: "#1E3A5F",
    border: "#E5E7EB",
    cardBg: "#FFFFFF",
  },
};

export function getTheme(category: string): ColorTheme {
  return themes[category] || themes.food;
}

// 공통 스타일
export const SECTION_WIDTH = 860;

export const commonStyles = {
  sectionBase: {
    width: `${SECTION_WIDTH}px`,
    fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    boxSizing: "border-box" as const,
  },
  h1: {
    fontSize: "42px",
    fontWeight: "800" as const,
    lineHeight: "1.3",
    margin: 0,
  },
  h2: {
    fontSize: "32px",
    fontWeight: "700" as const,
    lineHeight: "1.3",
    margin: 0,
  },
  h3: {
    fontSize: "24px",
    fontWeight: "600" as const,
    lineHeight: "1.4",
    margin: 0,
  },
  body: {
    fontSize: "16px",
    fontWeight: "400" as const,
    lineHeight: "1.7",
    margin: 0,
  },
  label: {
    fontSize: "14px",
    fontWeight: "500" as const,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    margin: 0,
  },
};
