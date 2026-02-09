// 제품 분석 결과 (강화된 버전)
export interface ProductAnalysis {
  brand: string;
  productName: string;
  productType: string;
  category: "skincare" | "food" | "electronics" | "fashion" | "household";
  mainColors: string[];
  brandTone: "luxury" | "natural" | "modern" | "playful";
  keyFeatures: string[];
  ingredients: string[];
  targetBenefits: string[];
  suggestedPromptStyle: string;
  // 강화된 필드
  usageType: "oral" | "topical" | "device" | "wearable" | "general";
  certifications: string[];
  volume: string;
  nutritionInfo: Record<string, string> | null;
}

// 12개 섹션의 AI 생성 텍스트 구조
export interface SectionContents {
  hero: {
    englishSubtitle: string;
    headline: string;
    subheadline: string;
    description: string;
    badges: string[];
  };
  brandStory: {
    title: string;
    subtitle: string;
    description: string;
  };
  target: {
    subtitle: string;
    headline: string;
    description: string;
  };
  features: {
    englishTitle: string;
    headline: string;
    description: string;
    badges: Array<{ label: string }>;
  };
  manufacturing: {
    headline: string;
    subtitle: string;
    items: Array<{ title: string; description: string }>;
  };
  certification: {
    headline: string;
    description: string;
    items: Array<{ label: string }>;
  };
  specs: {
    headline: string;
    productName: string;
    totalInfo: string;
    nutritionTable: Array<{ name: string; value: string; percent: string }>;
    notices: string[];
  };
  purchaseOptions: {
    headline: string;
    options: Array<{ name: string; description: string; badge: string }>;
  };
  howToUse: {
    headline: string;
    steps: Array<{ title: string; description: string }>;
  };
  reviews: {
    headline: string;
    rating: number;
    reviewCount: number;
    participantCount: number;
    reviews: Array<{ author: string; date: string; content: string }>;
  };
  faq: {
    headline: string;
    description: string;
    items: Array<{ question: string; answer: string }>;
  };
  shipping: {
    headline: string;
    deliveryInfo: string;
    exchangePolicy: { possible: string[]; impossible: string[] };
    customerCenter: { brandName: string; phone: string; hours: string };
  };
}

// 섹션 메타 정보
export interface SectionMeta {
  id: string;
  nameKo: string;
  enabled: boolean;
  order: number;
  needsAiImage: boolean;
}

export const DEFAULT_SECTIONS: SectionMeta[] = [
  { id: "hero", nameKo: "히어로", enabled: true, order: 0, needsAiImage: true },
  { id: "brandStory", nameKo: "브랜드 스토리", enabled: true, order: 1, needsAiImage: true },
  { id: "target", nameKo: "타겟/추천", enabled: true, order: 2, needsAiImage: false },
  { id: "features", nameKo: "핵심 강점", enabled: true, order: 3, needsAiImage: false },
  { id: "manufacturing", nameKo: "제조 노하우", enabled: true, order: 4, needsAiImage: false },
  { id: "certification", nameKo: "품질 인증", enabled: true, order: 5, needsAiImage: false },
  { id: "specs", nameKo: "제품 스펙", enabled: true, order: 6, needsAiImage: false },
  { id: "purchaseOptions", nameKo: "구매 옵션", enabled: true, order: 7, needsAiImage: false },
  { id: "howToUse", nameKo: "사용법", enabled: true, order: 8, needsAiImage: false },
  { id: "reviews", nameKo: "고객 후기", enabled: true, order: 9, needsAiImage: false },
  { id: "faq", nameKo: "FAQ", enabled: true, order: 10, needsAiImage: false },
  { id: "shipping", nameKo: "배송/CS", enabled: true, order: 11, needsAiImage: false },
];
