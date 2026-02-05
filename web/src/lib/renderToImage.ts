import html2canvas from "html2canvas";

export async function renderToImage(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2, // 2x 해상도
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  return canvas.toDataURL("image/jpeg", 0.95);
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
