import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 제품 분석 결과 타입
interface ProductAnalysis {
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
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const apiKey = formData.get("apiKey") as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "이미지가 필요합니다." },
        { status: 400 }
      );
    }

    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: "API 키가 필요합니다." },
        { status: 400 }
      );
    }

    // 이미지를 base64로 변환
    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // Gemini Vision API 호출
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const analysisPrompt = `이 제품 이미지를 분석해서 다음 정보를 JSON으로 추출해주세요.
반드시 아래 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.

{
  "brand": "브랜드명 (이미지에서 읽을 수 있으면 추출, 없으면 'Unknown')",
  "productName": "제품명 (추론 가능하면 작성)",
  "productType": "제품 유형 (예: 세럼, 크림, 음료, 스마트폰 등)",
  "category": "카테고리 (skincare, food, electronics, fashion, household 중 하나)",
  "mainColors": ["제품의 주요 색상 2-3개 (HEX 코드)"],
  "brandTone": "브랜드 느낌 (luxury, natural, modern, playful 중 하나)",
  "keyFeatures": ["제품의 핵심 특징 3가지"],
  "ingredients": ["핵심 성분 (읽을 수 있으면, 없으면 빈 배열)"],
  "targetBenefits": ["타겟 효능/베네핏 3가지"],
  "suggestedPromptStyle": "이 제품에 어울리는 AI 이미지 생성 스타일 설명 (영어로, 2-3문장)"
}

분석 시 고려사항:
- 이미지에 텍스트가 있으면 OCR로 읽어서 활용
- 제품 패키지 디자인에서 브랜드 톤 추론
- 제품 색상과 디자인에서 적합한 스타일 추천
- 카테고리에 맞는 전문적인 용어 사용`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64,
        },
      },
      { text: analysisPrompt },
    ]);

    const responseText = result.response.text();
    
    // JSON 파싱 (마크다운 코드블록 제거)
    let jsonText = responseText;
    if (jsonText.includes("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }
    
    const analysis: ProductAnalysis = JSON.parse(jsonText.trim());

    // 카테고리별 추천 프롬프트 스타일 보강
    const categoryStyles: Record<string, string> = {
      skincare: "luxury cosmetic photography, soft lighting, elegant cream background, premium beauty brand aesthetic",
      food: "fresh food photography, natural lighting, clean white background, appetizing and healthy look",
      electronics: "modern tech product photography, sleek dark background, dramatic lighting, futuristic feel",
      fashion: "stylish fashion photography, trendy aesthetic, clean backdrop, editorial look",
      household: "clean minimal product photography, bright white background, practical and trustworthy feel",
    };

    analysis.suggestedPromptStyle = 
      analysis.suggestedPromptStyle || categoryStyles[analysis.category] || categoryStyles.skincare;

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("이미지 분석 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message || "분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
