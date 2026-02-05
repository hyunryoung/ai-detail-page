// 프롬프트 데이터 타입 정의

export interface Prompt {
  id: string;
  title_cn: string;
  title_ko?: string;
  category: string;
  category_ko: string;
  category_en: string;
  tags: string[];
  tags_ko?: string[];
  thumbnail_url: string;
  source_url?: string;
  source_name?: string;
  prompt_en: string;
  prompt_ko?: string;
  negative_prompt_en: string;
  negative_prompt_ko?: string;
  prompt_cn?: string;
  negative_prompt_cn?: string;
}

export interface Category {
  id: string;
  name_ko: string;
  name_en: string;
  count?: number;
}

export const CATEGORIES: Category[] = [
  { id: "portrait", name_ko: "인물", name_en: "Portrait" },
  { id: "product", name_ko: "제품", name_en: "Product" },
  { id: "food", name_ko: "음식", name_en: "Food" },
  { id: "fashion", name_ko: "패션", name_en: "Fashion" },
  { id: "landscape", name_ko: "풍경", name_en: "Landscape" },
  { id: "graphic", name_ko: "그래픽", name_en: "Graphic" },
  { id: "character", name_ko: "캐릭터", name_en: "Character" },
  { id: "vehicle", name_ko: "자동차/탈것", name_en: "Vehicle" },
];
