import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const generateCopyPrompt = (productName: string, productDescription: string) => {
  return `당신은 전문 상세페이지 카피라이터입니다. 아래 제품 정보를 바탕으로 네이버 스마트스토어 상세페이지에 적합한 카피를 작성해주세요.

제품명: ${productName}
제품 설명: ${productDescription || "정보 없음"}

다음 형식으로 작성해주세요:

1. 메인 헤드라인 (한 문장, 감성적이고 임팩트 있게)
2. 서브 헤드라인 (두 문장 이내)
3. 주요 특징 (3-5개 bullet point)
4. 이런 분께 추천해요 (3개 bullet point)
5. 배송/안내 문구 (간단히)

톤앤매너: 친근하면서도 신뢰감 있게, 이모지 적절히 사용
`;
};

export async function POST(request: NextRequest) {
  try {
    const { productName, productDescription, apiKey } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: "제품명은 필수입니다." },
        { status: 400 }
      );
    }

    // 클라이언트 API 키 또는 서버 환경변수 사용
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다. 설정에서 Gemini API 키를 입력해주세요." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = generateCopyPrompt(productName, productDescription);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      copy: text,
    });
  } catch (error: any) {
    console.error("카피 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "카피 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
