import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProductAnalysis } from "@/types/sections";

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

    const bytes = await imageFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const analysisPrompt = `이 제품 이미지를 정밀하게 분석해서 다음 정보를 JSON으로 추출해주세요.
반드시 아래 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요.

{
  "brand": "브랜드명 (이미지에서 OCR로 정확히 읽기, 없으면 'Unknown')",
  "productName": "제품명 (이미지에서 OCR로 정확히 읽기)",
  "productType": "제품 유형 (예: 발효환, 세럼, 크림, 음료, 스마트폰 등 - 구체적으로)",
  "category": "카테고리 (skincare, food, electronics, fashion, household 중 하나)",
  "mainColors": ["제품 패키지의 주요 색상 2-3개 (HEX 코드)"],
  "brandTone": "브랜드 느낌 (luxury, natural, modern, playful 중 하나)",
  "keyFeatures": ["제품의 핵심 특징 3-5가지 (이미지에서 읽을 수 있는 정보 우선)"],
  "ingredients": ["핵심 성분 (이미지에서 읽을 수 있으면 추출, 없으면 제품 유형으로 추론)"],
  "targetBenefits": ["타겟 효능/베네핏 3가지"],
  "suggestedPromptStyle": "이 제품에 어울리는 AI 이미지 생성 스타일 (영어, 2-3문장)",
  "usageType": "사용법 타입 (oral=경구섭취, topical=피부도포, device=전자기기, wearable=착용, general=일반)",
  "certifications": ["인증 마크 (HACCP, GMP, ISO, KC, 유기농 등 - 이미지에서 보이는 것만)"],
  "volume": "내용량/용량 (예: 250g, 50ml, 1개 등 - 이미지에서 읽기)",
  "nutritionInfo": null
}

분석 시 반드시 지켜야 할 규칙:
1. 이미지에 있는 텍스트를 OCR로 최대한 정확히 읽어서 활용
2. 특히 브랜드명, 제품명, 용량, 성분, 인증마크는 이미지에서 직접 읽기
3. usageType은 제품 형태를 보고 정확히 판단 (환/알약/캡슐 = oral, 크림/세럼 = topical 등)
4. certifications는 이미지에서 HACCP, GMP 등의 마크가 보이면 추출
5. 카테고리는 food(건강식품/식품), skincare(화장품), electronics(전자기기), fashion(의류), household(생활용품) 중 선택
6. nutritionInfo는 영양성분표가 보이면 {"칼로리": "320kcal", "탄수화물": "45g"} 형태로, 안 보이면 null`;

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

    let jsonText = responseText;
    if (jsonText.includes("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const analysis: ProductAnalysis = JSON.parse(jsonText.trim());

    // 기본값 보정
    if (!analysis.usageType) analysis.usageType = "general";
    if (!analysis.certifications) analysis.certifications = [];
    if (!analysis.volume) analysis.volume = "";
    if (!analysis.nutritionInfo) analysis.nutritionInfo = null;

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
