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

    // 이미지가 있으면 함께 전송 (제품을 장면에 자연스럽게 배치)
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      
      // 제품 배치 프롬프트
      const editPrompt = `You are given a product image (possibly with transparent background). Your task is to create a beautiful commercial product photography scene.

Instructions:
1. Keep the EXACT product from the image - preserve all labels, text, colors, shape
2. Place the product naturally in this scene: ${prompt}
3. Add realistic shadows, reflections, and lighting that match the scene
4. The product should look like it was photographed in this setting
5. Make it look like a professional commercial product photo
6. DO NOT add any text, watermarks, or captions
7. The product must be the main focus of the image

Scene: ${prompt}
Quality: Professional commercial photography, high quality, 860px width.
CRITICAL: Keep the product identical to the original. NO TEXT in the output.`;

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
