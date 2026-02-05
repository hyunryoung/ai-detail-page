// 섹션 구조 정의
export interface Section {
  id: number;
  name: string;
  nameKo: string;
  purpose: string;
  required: boolean;
}

export const sectionStructure: Section[] = [
  {
    id: 1,
    name: "hero",
    nameKo: "히어로",
    purpose: "제품 첫인상, 핵심 메시지 전달",
    required: true,
  },
  {
    id: 2,
    name: "benefits",
    nameKo: "효능/베네핏",
    purpose: "제품의 핵심 효과 3가지 시각화",
    required: true,
  },
  {
    id: 3,
    name: "product_shot",
    nameKo: "AI 연출컷",
    purpose: "AI가 생성한 제품 연출 이미지",
    required: true,
  },
  {
    id: 4,
    name: "ingredients",
    nameKo: "핵심 성분",
    purpose: "주요 성분 이미지와 설명",
    required: false,
  },
  {
    id: 5,
    name: "how_to_use",
    nameKo: "사용법",
    purpose: "사용 방법 단계별 안내",
    required: true,
  },
  {
    id: 6,
    name: "reviews",
    nameKo: "리뷰/후기",
    purpose: "고객 만족도, 사회적 증거",
    required: false,
  },
  {
    id: 7,
    name: "cta",
    nameKo: "구매 유도",
    purpose: "구매 버튼, 프로모션 안내",
    required: true,
  },
];

// 카테고리별 프롬프트 템플릿
export interface CategoryPrompt {
  styleKeywords: string[];
  backgroundColors: string[];
  mood: string[];
  heroTemplate: string;
  benefitsTemplate: string;
  productShotTemplate: string;
  howToUseTemplate: string;
  ctaTemplate: string;
}

export const categoryPrompts: Record<string, CategoryPrompt> = {
  skincare: {
    styleKeywords: ["luxury", "elegant", "premium", "soft lighting"],
    backgroundColors: ["cream", "ivory", "champagne", "soft gold"],
    mood: ["sophisticated", "clean", "serene"],
    heroTemplate: `Luxury skincare product hero image. Elegant {background} background with soft golden light. 
{productName} displayed prominently. Premium cosmetic photography style, high-end beauty brand aesthetic.
Product color: {mainColor}. 800px width, vertical layout for detail page.`,
    benefitsTemplate: `Skincare benefits infographic. {background} gradient background. 
Three circular icons in gold line art style showing: {benefit1}, {benefit2}, {benefit3}. 
Premium beauty marketing aesthetic. Clean Korean cosmetic brand style. 800px width.`,
    productShotTemplate: `{productName} luxurious product photography. 
Elegant setting with {background} background, soft natural lighting, botanical elements.
Premium beauty brand aesthetic, magazine quality. Main color: {mainColor}. 800px width.`,
    howToUseTemplate: `Skincare product usage tutorial infographic. {background} background.
Three step illustration: Step 1 dispense, Step 2 apply to face, Step 3 gentle massage.
Elegant gold line art icons, premium beauty brand style. 800px width, vertical layout.`,
    ctaTemplate: `Skincare product call-to-action banner. {background} gradient with golden accents.
Beautiful model with glowing skin, {productName} displayed. Luxury beauty brand aesthetic.
Space for headline text and purchase button. 800px width.`,
  },
  food: {
    styleKeywords: ["fresh", "natural", "organic", "vibrant"],
    backgroundColors: ["white", "light green", "natural wood"],
    mood: ["healthy", "appetizing", "trustworthy"],
    heroTemplate: `Fresh food product hero image. Clean {background} background with natural lighting.
{productName} with fresh ingredients around. Appetizing food photography style.
Product color: {mainColor}. 800px width, vertical layout.`,
    benefitsTemplate: `Food product benefits infographic. {background} background.
Three icons showing: {benefit1}, {benefit2}, {benefit3}. 
Fresh and healthy aesthetic, Korean food brand style. 800px width.`,
    productShotTemplate: `{productName} appetizing food photography.
Natural setting with {background} background, fresh ingredients, warm lighting.
Healthy lifestyle aesthetic. Main color: {mainColor}. 800px width.`,
    howToUseTemplate: `Food product usage guide infographic. {background} background.
Three steps: preparation, consumption, storage. Natural green icons.
Clean healthy food brand style. 800px width.`,
    ctaTemplate: `Food product promotional banner. {background} background with fresh elements.
Healthy lifestyle scene, {productName} featured. Appetizing aesthetic.
Space for promotional text. 800px width.`,
  },
  electronics: {
    styleKeywords: ["modern", "sleek", "innovative", "minimal"],
    backgroundColors: ["dark gray", "black", "deep blue"],
    mood: ["futuristic", "professional", "cutting-edge"],
    heroTemplate: `Modern tech product hero image. Sleek {background} background with subtle gradient.
{productName} with dramatic lighting. Premium electronics photography style.
Product color: {mainColor}. 800px width, vertical layout.`,
    benefitsTemplate: `Tech product features infographic. {background} gradient background.
Three modern icons showing: {benefit1}, {benefit2}, {benefit3}.
Futuristic minimal design, tech brand aesthetic. 800px width.`,
    productShotTemplate: `{productName} cutting-edge tech product photography.
Modern setting with {background} background, dramatic lighting, reflection.
Premium electronics brand aesthetic. Main color: {mainColor}. 800px width.`,
    howToUseTemplate: `Tech product setup guide infographic. {background} background.
Three steps with modern blue icons: unbox, connect, enjoy.
Sleek tech brand style, minimal design. 800px width.`,
    ctaTemplate: `Tech product promotional banner. {background} gradient with blue accents.
Futuristic scene, {productName} featured prominently. Premium tech aesthetic.
Space for specs and purchase button. 800px width.`,
  },
  fashion: {
    styleKeywords: ["stylish", "trendy", "chic", "editorial"],
    backgroundColors: ["neutral", "pastel", "soft gray"],
    mood: ["trendy", "aspirational", "confident"],
    heroTemplate: `Stylish fashion product hero image. Clean {background} background.
{productName} displayed elegantly. Editorial fashion photography style.
Product color: {mainColor}. 800px width, vertical layout.`,
    benefitsTemplate: `Fashion product features. {background} background.
Three elegant icons showing: {benefit1}, {benefit2}, {benefit3}.
Trendy minimalist design, fashion brand aesthetic. 800px width.`,
    productShotTemplate: `{productName} editorial fashion photography.
Stylish setting with {background} background, soft lighting.
High-end fashion brand aesthetic. Main color: {mainColor}. 800px width.`,
    howToUseTemplate: `Fashion styling guide infographic. {background} background.
Three style suggestions with chic icons. Editorial fashion aesthetic.
Trendy minimalist design. 800px width.`,
    ctaTemplate: `Fashion promotional banner. {background} gradient with stylish elements.
Model wearing/using {productName}. Aspirational lifestyle aesthetic.
Space for promotional text. 800px width.`,
  },
  household: {
    styleKeywords: ["clean", "simple", "practical", "trustworthy"],
    backgroundColors: ["white", "light blue", "soft gray"],
    mood: ["clean", "practical", "reliable"],
    heroTemplate: `Clean household product hero image. Bright {background} background.
{productName} displayed clearly. Simple product photography style.
Product color: {mainColor}. 800px width, vertical layout.`,
    benefitsTemplate: `Household product benefits. {background} background.
Three simple icons showing: {benefit1}, {benefit2}, {benefit3}.
Clean practical design, trustworthy brand aesthetic. 800px width.`,
    productShotTemplate: `{productName} clean household product photography.
Simple setting with {background} background, bright even lighting.
Practical and reliable brand aesthetic. Main color: {mainColor}. 800px width.`,
    howToUseTemplate: `Household product usage guide. {background} background.
Three simple steps with clean practical icons.
Easy to follow instructions, trustworthy brand style. 800px width.`,
    ctaTemplate: `Household product promotional banner. {background} background.
Clean and practical scene with {productName}. Reliable brand aesthetic.
Space for promotional text and action button. 800px width.`,
  },
};

// 디자인 프리셋
export interface DesignPreset {
  name: string;
  nameKo: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  typography: string;
  elements: string[];
}

export const designPresets: Record<string, DesignPreset> = {
  luxury: {
    name: "luxury",
    nameKo: "럭셔리",
    colors: {
      primary: "#C4922A",
      background: "#FFFEF5",
      text: "#2C2419",
      accent: "#D4AF37",
    },
    typography: "serif + sans-serif",
    elements: ["gold accents", "soft shadows", "botanical elements"],
  },
  natural: {
    name: "natural",
    nameKo: "내추럴",
    colors: {
      primary: "#4A7C59",
      background: "#F5F5F0",
      text: "#2D3B2D",
      accent: "#8FB996",
    },
    typography: "rounded sans-serif",
    elements: ["leaf patterns", "organic shapes", "earth tones"],
  },
  modern: {
    name: "modern",
    nameKo: "모던",
    colors: {
      primary: "#2563EB",
      background: "#F8FAFC",
      text: "#0F172A",
      accent: "#3B82F6",
    },
    typography: "geometric sans-serif",
    elements: ["clean lines", "minimal decoration", "bold contrast"],
  },
  playful: {
    name: "playful",
    nameKo: "플레이풀",
    colors: {
      primary: "#EC4899",
      background: "#FDF2F8",
      text: "#1F2937",
      accent: "#F472B6",
    },
    typography: "rounded friendly fonts",
    elements: ["illustrations", "patterns", "bright accents"],
  },
};

// 프롬프트 생성 함수
export function generateSectionPrompt(
  sectionName: string,
  productInfo: {
    brand: string;
    productName: string;
    category: string;
    mainColors: string[];
    brandTone: string;
    targetBenefits: string[];
  }
): string {
  const categoryTemplate = categoryPrompts[productInfo.category] || categoryPrompts.skincare;
  const preset = designPresets[productInfo.brandTone] || designPresets.luxury;
  const background = categoryTemplate.backgroundColors[0];
  const mainColor = productInfo.mainColors[0] || preset.colors.primary;

  const replacements: Record<string, string> = {
    "{productName}": `${productInfo.brand} ${productInfo.productName}`,
    "{background}": background,
    "{mainColor}": mainColor,
    "{benefit1}": productInfo.targetBenefits[0] || "효과 1",
    "{benefit2}": productInfo.targetBenefits[1] || "효과 2",
    "{benefit3}": productInfo.targetBenefits[2] || "효과 3",
  };

  let template = "";
  switch (sectionName) {
    case "hero":
      template = categoryTemplate.heroTemplate;
      break;
    case "benefits":
      template = categoryTemplate.benefitsTemplate;
      break;
    case "product_shot":
      template = categoryTemplate.productShotTemplate;
      break;
    default:
      template = categoryTemplate.productShotTemplate;
  }

  // 플레이스홀더 교체
  for (const [key, value] of Object.entries(replacements)) {
    template = template.replace(new RegExp(key, "g"), value);
  }

  return template;
}
