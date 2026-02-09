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
    let contents: any[] = [];

    // 이미지가 있으면 함께 전송 (배경만 교체, 제품 유지 모드)
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      
      // 제품 유지 + 배경 교체 프롬프트 (매우 강조)
      const editPrompt = `IMPORTANT: You MUST keep the EXACT product from the image. DO NOT change, modify, or recreate the product itself.

Your task: ONLY replace the background while keeping the product EXACTLY as it appears.

Instructions:
1. PRESERVE the product exactly - same shape, color, design, label, text, everything
2. REMOVE the current background (usually white/plain)
3. REPLACE with new background: ${prompt}
4. The product should look naturally placed in the new background
5. Add appropriate shadows and lighting that match the new background
6. Keep the product in sharp focus
7. DO NOT add any text, logos, watermarks, or captions to the image
8. The output should be a clean product photo with NO text overlays

Style for new background: ${prompt}
Professional commercial photography, high quality, 860px width.

CRITICAL: The product must be 100% identical to the original. Only the background changes. NO TEXT in the generated image.`;

      contents = [
        { text: editPrompt },
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64,
          },
        },
      ];
    } else {
      // 이미지 없으면 배경만 생성
      const bgOnlyPrompt = `${prompt}. Professional commercial photography background, high quality, 860px width. Empty space in center for product placement.`;
      contents = [{ text: bgOnlyPrompt }];
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
