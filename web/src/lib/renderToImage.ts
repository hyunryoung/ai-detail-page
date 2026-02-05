import { toJpeg } from "html-to-image";

export async function renderToImage(element: HTMLElement): Promise<string> {
  try {
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2, // 2x 해상도
      backgroundColor: "#ffffff",
      skipFonts: true, // 폰트 처리 스킵 (속도 향상)
      filter: (node) => {
        // 스타일시트 링크 무시
        if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
          return false;
        }
        return true;
      }
    });

    return dataUrl;
  } catch (error) {
    console.error("html-to-image 오류:", error);
    throw error;
  }
}

export function downloadImage(dataUrl: string, filename: string) {
  try {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("다운로드 오류:", error);
    // 폴백: 새 탭에서 열기
    window.open(dataUrl, "_blank");
  }
}
