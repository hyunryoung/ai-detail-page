// 프롬프트 데이터 로딩 및 관리
// 초기에는 JSON 파일에서 로드, 추후 Firebase로 마이그레이션

import { Prompt, Category, CATEGORIES } from "@/types/prompt";
import promptsData from "@/data/prompts.json";

// 모든 프롬프트 가져오기
export function getAllPrompts(): Prompt[] {
  return promptsData as Prompt[];
}

// 카테고리별 프롬프트 가져오기
export function getPromptsByCategory(categoryId: string): Prompt[] {
  const prompts = getAllPrompts();
  if (categoryId === "all") return prompts;
  return prompts.filter((p) => p.category === categoryId);
}

// 단일 프롬프트 가져오기
export function getPromptById(id: string): Prompt | undefined {
  const prompts = getAllPrompts();
  return prompts.find((p) => p.id === id);
}

// 검색
export function searchPrompts(query: string): Prompt[] {
  const prompts = getAllPrompts();
  const lowerQuery = query.toLowerCase();
  
  return prompts.filter((p) => {
    const searchText = [
      p.title_cn,
      p.title_ko,
      p.prompt_en,
      p.prompt_ko,
      ...p.tags,
      ...(p.tags_ko || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    
    return searchText.includes(lowerQuery);
  });
}

// 카테고리 목록 (프롬프트 수 포함)
export function getCategoriesWithCount(): Category[] {
  const prompts = getAllPrompts();
  
  return CATEGORIES.map((cat) => ({
    ...cat,
    count: prompts.filter((p) => p.category === cat.id).length,
  }));
}

// 랜덤 프롬프트 가져오기
export function getRandomPrompts(count: number): Prompt[] {
  const prompts = getAllPrompts();
  const shuffled = [...prompts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
