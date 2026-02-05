import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productName = formData.get("productName") as string;
    const prompt = formData.get("prompt") as string;
    const imageFile = formData.get("image") as File | null;
    const apiKey = formData.get("apiKey") as string | null;

    if (!productName || !prompt) {
      return NextResponse.json(
        { error: "제품명과 프롬프트는 필수입니다." },
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
    
    // Gemini 2.0 Flash 이미지 생성 모델
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        responseModalities: ["Text", "Image"],
      } as any,
    });

    // 프롬프트 구성
    const enhancedPrompt = `Create a professional product photography of "${productName}". ${prompt}. High quality, professional studio lighting, clean and elegant composition, commercial product shot style, 4K quality.`;

    let contents: any[] = [{ text: enhancedPrompt }];

    // 이미지가 있으면 함께 전송 (이미지 편집 모드)
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      
      contents = [
        { text: `Edit this product image with the following style: ${prompt}. Keep the product but change the background and styling to match: ${enhancedPrompt}` },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64,
          },
        },
      ];
    }

    const result = await model.generateContent(contents);
    const response = await result.response;

    // 응답에서 이미지 추출
    const parts = response.candidates?.[0]?.content?.parts || [];
    let generatedImageBase64 = null;
    let textResponse = "";

    for (const part of parts) {
      if ((part as any).inlineData) {
        generatedImageBase64 = (part as any).inlineData.data;
      }
      if ((part as any).text) {
        textResponse = (part as any).text;
      }
    }

    if (!generatedImageBase64) {
      return NextResponse.json({
        success: false,
        error: "이미지 생성에 실패했습니다.",
        text: textResponse,
      });
    }

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${generatedImageBase64}`,
      text: textResponse,
    });
  } catch (error: any) {
    console.error("이미지 생성 오류:", error);
    return NextResponse.json(
      { 
        error: "이미지 생성 중 오류가 발생했습니다.",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
