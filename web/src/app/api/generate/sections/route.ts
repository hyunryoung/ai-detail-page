import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProductAnalysis, SectionContents } from "@/types/sections";

export async function POST(request: NextRequest) {
  try {
    const { analysis, apiKey } = (await request.json()) as {
      analysis: ProductAnalysis;
      apiKey?: string;
    };

    if (!analysis || !analysis.productName) {
      return NextResponse.json(
        { success: false, error: "제품 분석 데이터가 필요합니다." },
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

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = buildSectionPrompt(analysis);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // JSON 파싱
    let jsonText = responseText;
    if (jsonText.includes("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.includes("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const sections: SectionContents = JSON.parse(jsonText.trim());

    return NextResponse.json({
      success: true,
      sections,
    });
  } catch (error: any) {
    console.error("섹션 텍스트 생성 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "섹션 텍스트 생성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

function buildSectionPrompt(analysis: ProductAnalysis): string {
  const {
    brand,
    productName,
    productType,
    category,
    brandTone,
    keyFeatures,
    ingredients,
    targetBenefits,
    usageType,
    certifications,
    volume,
    nutritionInfo,
  } = analysis;

  // 사용법 타입에 따른 가이드
  const usageGuide: Record<string, string> = {
    oral: "경구 섭취 제품 (환, 캡슐, 음료 등). 사용법은 '1일 N회 섭취', '물과 함께', '공복에' 등으로 작성.",
    topical: "피부 도포 제품 (크림, 세럼, 로션 등). 사용법은 '적당량을 덜어', '피부에 발라' 등으로 작성.",
    device: "전자기기. 사용법은 '전원 켜기', '설정', '충전' 등으로 작성.",
    wearable: "착용 제품 (의류, 악세서리 등). 사용법은 '착용법', '세탁법' 등으로 작성.",
    general: "일반 제품. 사용법을 제품 특성에 맞게 작성.",
  };

  const toneGuide: Record<string, string> = {
    luxury: "고급스럽고 세련된 톤. 프리미엄 느낌, 정제된 표현 사용.",
    natural: "자연스럽고 따뜻한 톤. 건강한 이미지, 순수한 느낌 강조.",
    modern: "세련되고 미니멀한 톤. 깔끔하고 전문적인 표현.",
    playful: "밝고 에너지 넘치는 톤. 친근하고 즐거운 표현.",
  };

  return `당신은 한국 네이버 스마트스토어 상세페이지 전문 카피라이터입니다.
아래 제품 정보를 바탕으로 12개 섹션의 텍스트를 한국어로 작성해주세요.

=== 제품 정보 ===
- 브랜드: ${brand}
- 제품명: ${productName}
- 제품 유형: ${productType}
- 카테고리: ${category}
- 브랜드 톤: ${brandTone} (${toneGuide[brandTone] || toneGuide.modern})
- 핵심 특징: ${keyFeatures.join(", ")}
- 주요 성분: ${ingredients.length > 0 ? ingredients.join(", ") : "정보 없음"}
- 타겟 효능: ${targetBenefits.join(", ")}
- 사용법 타입: ${usageType} (${usageGuide[usageType] || usageGuide.general})
- 인증: ${certifications.length > 0 ? certifications.join(", ") : "해당 없음"}
- 용량: ${volume || "정보 없음"}
- 영양정보: ${nutritionInfo ? JSON.stringify(nutritionInfo) : "정보 없음"}

=== 작성 규칙 ===
1. 모든 텍스트는 한국어로 작성 (영어 서브타이틀/짧은 영어 라벨만 예외)
2. 제품 특성에 정확히 맞는 내용만 작성 (${usageType === "oral" ? "경구 제품이므로 '바르다/도포' 같은 표현 절대 사용 금지" : ""})
3. 구체적인 수치, 성분명, 효능을 활용해 전문성 있게 작성
4. 브랜드 톤(${brandTone})에 맞는 문체 유지
5. 리뷰는 실제처럼 자연스럽게 작성 (날짜는 202X.XX.XX 형식)
6. FAQ는 이 제품에 대해 소비자가 실제로 궁금해할 질문으로 작성

=== 반드시 아래 JSON 형식으로만 응답하세요 ===

{
  "hero": {
    "englishSubtitle": "영어 브랜드 키워드 (예: PREMIUM FERMENTED HEALTH)",
    "headline": "메인 헤드라인 (강렬하고 임팩트 있게, 15자 이내)",
    "subheadline": "서브 헤드라인 (핵심 셀링포인트, 20자 이내)",
    "description": "제품 소개 문구 (1~2문장)",
    "badges": ["신뢰 배지 1", "신뢰 배지 2"]
  },
  "brandStory": {
    "title": "브랜드 스토리 타이틀 (4~6자)",
    "subtitle": "서브 타이틀 (4~6자)",
    "description": "브랜드/제조 스토리 (3~5문장, 제품의 철학과 정성을 담아서)"
  },
  "target": {
    "subtitle": "타겟 설명 소제목 (예: 일상의 활기를 되찾고 싶은 분들께)",
    "headline": "타겟 메인 카피 (2줄, 임팩트 있게)",
    "description": "타겟 상세 설명 (2~4문장, 구체적인 사용 시나리오 포함)"
  },
  "features": {
    "englishTitle": "영어 캐치프레이즈 (예: Freshness up!)",
    "headline": "핵심 강점 헤드라인 (2줄 이내)",
    "description": "강점 설명 (2~3문장)",
    "badges": [
      {"label": "강점 배지 1"},
      {"label": "강점 배지 2"},
      {"label": "강점 배지 3"},
      {"label": "강점 배지 4"},
      {"label": "강점 배지 5"},
      {"label": "강점 배지 6"}
    ]
  },
  "manufacturing": {
    "headline": "제조 노하우 헤드라인",
    "subtitle": "서브 설명",
    "items": [
      {"title": "포인트1 제목 (6자 이내)", "description": "설명 (2문장)"},
      {"title": "포인트2 제목 (6자 이내)", "description": "설명 (2문장)"},
      {"title": "포인트3 제목 (6자 이내)", "description": "설명 (2문장)"}
    ]
  },
  "certification": {
    "headline": "인증/품질 헤드라인 (예: 안심 품질 6가지 약속)",
    "description": "인증 설명 (1~2문장)",
    "items": [
      {"label": "인증1 (예: HACCP 인증 완료)"},
      {"label": "인증2"},
      {"label": "인증3"},
      {"label": "인증4"},
      {"label": "인증5"},
      {"label": "인증6"}
    ]
  },
  "specs": {
    "headline": "제품 스펙 타이틀",
    "productName": "${brand} ${productName}",
    "totalInfo": "총 내용량/규격 정보",
    "nutritionTable": [
      {"name": "항목명", "value": "수치", "percent": "비율(%)"}
    ],
    "notices": ["주의사항 1", "주의사항 2", "주의사항 3"]
  },
  "purchaseOptions": {
    "headline": "구매 옵션 헤드라인 (예: 합리적인 구성을 만나보세요)",
    "options": [
      {"name": "옵션1 이름", "description": "설명", "badge": "혜택 배지"},
      {"name": "옵션2 이름", "description": "설명", "badge": "혜택 배지"}
    ]
  },
  "howToUse": {
    "headline": "사용법 헤드라인",
    "steps": [
      {"title": "Step 1 제목", "description": "설명 (1~2문장)"},
      {"title": "Step 2 제목", "description": "설명 (1~2문장)"},
      {"title": "Step 3 제목", "description": "설명 (1~2문장)"}
    ]
  },
  "reviews": {
    "headline": "리뷰 섹션 헤드라인",
    "rating": 4.8,
    "reviewCount": 1200,
    "participantCount": 13000,
    "reviews": [
      {"author": "닉네임1 님", "date": "202X.XX.XX XX:XX", "content": "자연스러운 리뷰 (2~3문장)"},
      {"author": "닉네임2 님", "date": "202X.XX.XX XX:XX", "content": "자연스러운 리뷰 (2~3문장)"},
      {"author": "닉네임3 님", "date": "202X.XX.XX XX:XX", "content": "자연스러운 리뷰 (2~3문장)"}
    ]
  },
  "faq": {
    "headline": "자주 묻는 질문",
    "description": "FAQ 소개 문구 (1~2문장)",
    "items": [
      {"question": "질문1", "answer": "답변1 (2~3문장)"},
      {"question": "질문2", "answer": "답변2 (2~3문장)"},
      {"question": "질문3", "answer": "답변3 (2~3문장)"},
      {"question": "질문4", "answer": "답변4 (2~3문장)"}
    ]
  },
  "shipping": {
    "headline": "신속하고 안전한 배송 안내",
    "deliveryInfo": "배송 정보 (택배사, 비용, 무료배송 조건 등)",
    "exchangePolicy": {
      "possible": ["교환/반품 가능 조건 1", "조건 2", "조건 3"],
      "impossible": ["교환/반품 불가 조건 1", "조건 2", "조건 3"]
    },
    "customerCenter": {
      "brandName": "${brand}",
      "phone": "080-000-0000",
      "hours": "오전 10시 ~ 오후 6시 (주말, 공휴일 휴무)"
    }
  }
}`;
}
