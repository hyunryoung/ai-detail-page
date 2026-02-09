// 프롬프트 매칭 로직 - V2 카테고리와 갤러리 프롬프트 연결

export interface GalleryPrompt {
  id: string;
  title_cn: string;
  tags: string[];
  thumbnail_url: string;
  prompt_en: string;
  negative_prompt_en: string;
  category: string;
  category_ko: string;
  category_en: string;
}

// V2 카테고리 → 프롬프트 카테고리 매핑 (우선순위 순)
const categoryMapping: Record<string, { primary: string[]; secondary: string[] }> = {
  skincare: { primary: ["product"], secondary: ["portrait", "fashion"] },
  food: { primary: ["food", "product"], secondary: [] },
  electronics: { primary: ["product"], secondary: ["graphic"] },
  fashion: { primary: ["fashion"], secondary: ["portrait"] },
  household: { primary: ["product"], secondary: ["graphic"] },
};

// 브랜드 톤 → 스타일 키워드 매핑
const toneKeywords: Record<string, string[]> = {
  luxury: ["luxurious", "elegant", "premium", "high-end", "cinematic"],
  natural: ["natural", "organic", "soft", "warm", "sunlight"],
  modern: ["modern", "minimal", "clean", "sleek", "professional"],
  playful: ["vibrant", "colorful", "fun", "bright", "dynamic"],
};

/**
 * V2 분석 결과를 기반으로 매칭되는 프롬프트 찾기
 */
export function findMatchingPrompts(
  prompts: GalleryPrompt[],
  category: string,
  brandTone: string,
  limit: number = 6
): GalleryPrompt[] {
  // 1. 카테고리 설정 가져오기
  const categoryConfig = categoryMapping[category] || { primary: ["product"], secondary: [] };
  const allCategories = [...categoryConfig.primary, ...categoryConfig.secondary];
  
  // 2. 유효한 프롬프트만 필터링
  const filtered = prompts.filter((p) =>
    allCategories.includes(p.category) &&
    typeof p.prompt_en === "string" &&
    p.prompt_en.length > 0 &&
    p.thumbnail_url
  );

  // 3. 점수 매기기
  const keywords = toneKeywords[brandTone] || [];
  
  const scored = filtered.map((prompt) => {
    let score = 0;
    const promptText = (prompt.prompt_en || "").toLowerCase();
    const tags = Array.isArray(prompt.tags) ? prompt.tags.join(" ").toLowerCase() : "";
    
    // 카테고리 우선순위 점수 (primary = +10, secondary = +2)
    if (categoryConfig.primary.includes(prompt.category)) {
      score += 10;
    } else if (categoryConfig.secondary.includes(prompt.category)) {
      score += 2;
    }
    
    // 브랜드 톤 키워드 매칭 점수
    for (const keyword of keywords) {
      if (promptText.includes(keyword)) score += 2;
      if (tags.includes(keyword)) score += 1;
    }
    
    // 제품 관련 키워드 보너스
    if (promptText.includes("product") || promptText.includes("commercial")) score += 3;
    if (promptText.includes("cosmetic") || promptText.includes("beauty")) score += 3;
    
    // 고품질 프롬프트 보너스 (길이, 디테일)
    if (promptText.length > 500) score += 1;
    if (promptText.includes("8k") || promptText.includes("ultra")) score += 1;
    
    return { prompt, score };
  });

  // 4. 점수 기준 정렬 후 상위 후보 중 랜덤 선택 (다양성 확보)
  const sorted = scored.sort((a, b) => b.score - a.score);
  
  // 상위 20개 후보 중에서 limit개를 랜덤하게 선택
  const candidatePool = sorted.slice(0, Math.min(20, sorted.length));
  
  // Fisher-Yates 셔플 알고리즘
  const shuffled = [...candidatePool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, limit).map((s) => s.prompt);
}

/**
 * 프롬프트를 제품 이미지 생성용으로 변환
 */
export function adaptPromptForProduct(
  originalPrompt: string,
  productName: string,
  productDescription: string,
  mainColor: string
): string {
  // 프롬프트의 핵심 스타일 요소 추출
  const styleKeywords = extractStyleKeywords(originalPrompt);
  
  // 제품 중심 프롬프트로 재구성
  const adaptedPrompt = `Professional product photography of ${productName}. ${productDescription}.
Main color: ${mainColor}. 
Style: ${styleKeywords.join(", ")}.
High-quality commercial photography, 800px width, vertical layout for e-commerce detail page.
${originalPrompt.includes("cinematic") ? "Cinematic lighting, " : ""}
${originalPrompt.includes("natural") ? "Natural soft lighting, " : ""}
${originalPrompt.includes("minimal") ? "Minimal clean background, " : ""}
Ultra-detailed, sharp focus, professional color grading.`;

  return adaptedPrompt;
}

/**
 * 프롬프트에서 스타일 키워드 추출
 */
function extractStyleKeywords(prompt: string | undefined | null): string[] {
  if (!prompt || typeof prompt !== "string") {
    return ["professional", "high-quality"];
  }
  
  const keywords: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  const stylePatterns = [
    { pattern: /cinematic/i, keyword: "cinematic" },
    { pattern: /luxury|luxurious/i, keyword: "luxurious" },
    { pattern: /natural light/i, keyword: "natural lighting" },
    { pattern: /soft light/i, keyword: "soft lighting" },
    { pattern: /minimal/i, keyword: "minimal" },
    { pattern: /professional/i, keyword: "professional" },
    { pattern: /high[- ]end/i, keyword: "high-end" },
    { pattern: /elegant/i, keyword: "elegant" },
    { pattern: /warm tone/i, keyword: "warm tones" },
    { pattern: /shallow depth/i, keyword: "shallow depth of field" },
    { pattern: /8k|ultra.?detail/i, keyword: "ultra-detailed" },
    { pattern: /film/i, keyword: "film aesthetic" },
  ];
  
  for (const { pattern, keyword } of stylePatterns) {
    if (pattern.test(lowerPrompt)) {
      keywords.push(keyword);
    }
  }
  
  return keywords.slice(0, 5); // 최대 5개
}

/**
 * 섹션별로 프롬프트 스타일 적용 - 배경만 생성 (제품 이미지는 별도 합성)
 */
export function generateStyledSectionPrompt(
  sectionName: string,
  stylePrompt: GalleryPrompt,
  productInfo: {
    productName: string;
    brand: string;
    category: string;
    mainColor: string;
    benefits: string[];
  }
): string {
  const styleKeywords = extractStyleKeywords(stylePrompt.prompt_en);
  const styleStr = styleKeywords.join(", ");
  
  const { mainColor } = productInfo;
  
  // 배경 스타일 설명 (API에서 제품 유지 + 배경 교체 처리)
  switch (sectionName) {
    case "hero":
      return `Hero section with ${styleStr} aesthetic.
${mainColor} gradient backdrop with elegant lighting effects, bokeh, soft glow.
Luxurious atmosphere, premium brand feel. 860px width, vertical layout.`;

    case "benefits":
      return `Benefits section with ${styleStr} style.
Soft gradient backdrop, ${mainColor} tones, subtle patterns.
Clean elegant commercial photography. 860px width.`;

    case "product_shot":
      return `${styleStr} product photography style.
Beautiful surface texture, professional studio lighting.
${mainColor} color accents, magazine-quality composition. 860px width.`;

    case "how_to_use":
      return `Usage guide section with ${styleStr} aesthetic.
Clean modern backdrop, ${mainColor} color scheme.
Professional instructional photography style. 860px width.`;

    case "cta":
      return `Call-to-action section with ${styleStr} mood.
${mainColor} theme with compelling glow effects.
Premium promotional banner style. 860px width.`;

    case "ingredients":
      return `Ingredients showcase with ${styleStr} aesthetic.
Scientific/botanical elements, ${mainColor} tones.
Sophisticated premium backdrop. 860px width.`;

    case "brand":
      return `Brand story section with ${styleStr} atmosphere.
Aspirational mood, ${mainColor} tones.
Premium brand identity aesthetic. 860px width.`;

    default:
      return `Professional commercial photography with ${styleStr} style. ${mainColor} tones. 860px width.`;
  }
}
