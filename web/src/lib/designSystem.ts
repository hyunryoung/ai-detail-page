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
  ingredientsTemplate: string;
  brandTemplate: string;
}

export const categoryPrompts: Record<string, CategoryPrompt> = {
  skincare: {
    styleKeywords: ["luxury", "elegant", "premium", "soft lighting"],
    backgroundColors: ["cream", "ivory", "champagne", "soft gold"],
    mood: ["sophisticated", "clean", "serene"],
    heroTemplate: `Luxury cosmetic brand hero background. 
Elegant {background} gradient with soft golden ambient light, bokeh effects.
Premium beauty brand aesthetic, empty center space for product placement.
Sophisticated clean backdrop. 860px width, vertical layout.`,
    benefitsTemplate: `Skincare benefits section background. 
Soft {background} gradient, subtle botanical shadow patterns, elegant light rays.
Premium beauty aesthetic backdrop. Clean minimalist. 860px width.`,
    productShotTemplate: `Luxurious product photography backdrop.
Elegant {background} surface with soft natural lighting, subtle botanical elements in corners.
Premium beauty brand aesthetic, magazine quality empty backdrop. 860px width.`,
    howToUseTemplate: `Skincare tutorial section background.
Soft {background} gradient with elegant light patterns.
Premium beauty brand style backdrop. 860px width, vertical layout.`,
    ctaTemplate: `Call-to-action banner background.
{background} gradient with golden accents, soft glow effects.
Luxury beauty brand aesthetic, space for text overlay. 860px width.`,
    ingredientsTemplate: `Ingredients showcase background.
{background} backdrop with soft lighting, subtle molecular patterns, botanical shadows.
Scientific premium aesthetic. 860px width.`,
    brandTemplate: `Brand story visual background.
Elegant {background} backdrop with golden ambient light, sophisticated atmosphere.
High-end beauty brand identity backdrop. 860px width.`,
  },
  food: {
    styleKeywords: ["fresh", "natural", "organic", "vibrant"],
    backgroundColors: ["white", "light green", "natural wood"],
    mood: ["healthy", "appetizing", "trustworthy"],
    heroTemplate: `Fresh food brand hero background.
Clean {background} surface with natural warm lighting, fresh ingredients scattered decoratively.
Empty center space for product placement. 860px width, vertical layout.`,
    benefitsTemplate: `Food benefits section background.
Soft {background} gradient with natural leaf shadows, fresh aesthetic.
Clean healthy backdrop. 860px width.`,
    productShotTemplate: `Appetizing food photography backdrop.
Natural {background} surface with fresh herbs, wooden elements, warm lighting.
Empty center for product placement. 860px width.`,
    howToUseTemplate: `Food usage guide background.
{background} backdrop with subtle natural patterns.
Clean healthy food brand style. 860px width.`,
    ctaTemplate: `Food promotional banner background.
{background} surface with fresh decorative elements at edges.
Healthy lifestyle backdrop, space for text. 860px width.`,
    ingredientsTemplate: `Ingredients showcase background.
{background} backdrop with scattered fresh ingredients at edges, natural lighting.
Organic aesthetic backdrop. 860px width.`,
    brandTemplate: `Food brand story background.
Clean {background} backdrop with natural farm elements, warm atmosphere.
Trustworthy brand aesthetic. 860px width.`,
  },
  electronics: {
    styleKeywords: ["modern", "sleek", "innovative", "minimal"],
    backgroundColors: ["dark gray", "black", "deep blue"],
    mood: ["futuristic", "professional", "cutting-edge"],
    heroTemplate: `Modern tech brand hero background.
Sleek {background} gradient with dramatic blue accent lighting, futuristic glow.
Empty center for product placement. 860px width, vertical layout.`,
    benefitsTemplate: `Tech features section background.
{background} gradient with subtle circuit patterns, modern blue accents.
Futuristic minimal backdrop. 860px width.`,
    productShotTemplate: `Tech product photography backdrop.
Modern {background} surface with dramatic lighting, subtle reflections.
Premium electronics aesthetic, empty center. 860px width.`,
    howToUseTemplate: `Tech setup guide background.
{background} backdrop with modern geometric patterns, blue accents.
Sleek tech brand style. 860px width.`,
    ctaTemplate: `Tech promotional banner background.
{background} gradient with futuristic blue glow effects.
Premium tech aesthetic, space for text. 860px width.`,
    ingredientsTemplate: `Tech components background.
{background} backdrop with subtle circuit board patterns, dramatic lighting.
Cutting-edge tech aesthetic. 860px width.`,
    brandTemplate: `Tech brand story background.
Sleek {background} backdrop with blue accent lighting, futuristic atmosphere.
Premium technology brand aesthetic. 860px width.`,
  },
  fashion: {
    styleKeywords: ["stylish", "trendy", "chic", "editorial"],
    backgroundColors: ["neutral", "pastel", "soft gray"],
    mood: ["trendy", "aspirational", "confident"],
    heroTemplate: `Stylish fashion brand hero background.
Clean {background} gradient with soft editorial lighting, elegant shadows.
Empty center for product placement. 860px width, vertical layout.`,
    benefitsTemplate: `Fashion features section background.
Soft {background} gradient with subtle textile patterns.
Trendy minimalist backdrop. 860px width.`,
    productShotTemplate: `Editorial fashion photography backdrop.
Stylish {background} surface with soft diffused lighting.
High-end fashion aesthetic, empty center. 860px width.`,
    howToUseTemplate: `Fashion styling guide background.
{background} backdrop with chic minimal elements.
Editorial fashion aesthetic. 860px width.`,
    ctaTemplate: `Fashion promotional banner background.
{background} gradient with stylish abstract elements.
Aspirational lifestyle backdrop, space for text. 860px width.`,
    ingredientsTemplate: `Fashion materials background.
{background} backdrop with subtle fabric textures, soft lighting.
Premium fashion aesthetic. 860px width.`,
    brandTemplate: `Fashion brand story background.
Editorial {background} backdrop with aspirational atmosphere.
Trendy fashion brand aesthetic. 860px width.`,
  },
  household: {
    styleKeywords: ["clean", "simple", "practical", "trustworthy"],
    backgroundColors: ["white", "light blue", "soft gray"],
    mood: ["clean", "practical", "reliable"],
    heroTemplate: `Clean household brand hero background.
Bright {background} surface with soft even lighting.
Empty center for product placement. 860px width, vertical layout.`,
    benefitsTemplate: `Household benefits section background.
Clean {background} gradient with subtle patterns.
Practical trustworthy backdrop. 860px width.`,
    productShotTemplate: `Clean household photography backdrop.
Simple {background} surface with bright even lighting.
Practical reliable aesthetic, empty center. 860px width.`,
    howToUseTemplate: `Household usage guide background.
{background} backdrop with clean minimal design.
Easy to follow, trustworthy style. 860px width.`,
    ctaTemplate: `Household promotional banner background.
Clean {background} surface with soft practical elements.
Reliable brand backdrop, space for text. 860px width.`,
    ingredientsTemplate: `Household materials background.
{background} backdrop with clean bright lighting.
Trustworthy practical aesthetic. 860px width.`,
    brandTemplate: `Household brand story background.
Clean {background} backdrop with family-friendly warm atmosphere.
Dependable brand aesthetic. 860px width.`,
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
    case "ingredients":
      template = categoryTemplate.ingredientsTemplate;
      break;
    case "how_to_use":
      template = categoryTemplate.howToUseTemplate;
      break;
    case "brand":
      template = categoryTemplate.brandTemplate;
      break;
    case "cta":
      template = categoryTemplate.ctaTemplate;
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
