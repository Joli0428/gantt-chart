import { APP_NAME, COPY } from "./constants";
import { prefersDownloadExport } from "./device";

export async function shareChart(
  captureEl: HTMLElement,
  projectName: string,
): Promise<{ success: boolean; message: string }> {
  const html2canvas = (await import("html2canvas")).default;
  const displayName = projectName || APP_NAME;

  const canvas = await html2canvas(captureEl, {
    backgroundColor: "#FFFFFF",
    scale: 2,
    useCORS: true,
    logging: false,
    width: captureEl.scrollWidth,
    windowWidth: captureEl.scrollWidth + 200,
  });

  const pad = 40;
  const titleH = 60;
  const final = document.createElement("canvas");
  final.width = canvas.width + pad * 2;
  final.height = canvas.height + pad * 2 + titleH;
  const ctx = final.getContext("2d");
  if (!ctx) throw new Error("無法建立 canvas context");

  ctx.fillStyle = "#F7F6F3";
  ctx.fillRect(0, 0, final.width, final.height);

  ctx.fillStyle = "#2C2B28";
  ctx.font = `500 ${28 * 2}px Lora, serif`;
  ctx.fillText(displayName, pad * 2, pad * 2 + 36);

  ctx.font = `300 ${11 * 2}px "Noto Sans TC", sans-serif`;
  ctx.fillStyle = "#B5B3AE";
  const today = new Date().toLocaleDateString("zh-TW");
  ctx.fillText(`Generated ${today}`, pad * 2, pad * 2 + 36 + 22);

  ctx.drawImage(canvas, pad, pad + titleH, canvas.width, canvas.height);

  const filename = `${displayName}_${APP_NAME}.png`;

  if (!prefersDownloadExport() && navigator.share && navigator.canShare) {
    const blob = await new Promise<Blob | null>((res) =>
      final.toBlob(res, "image/png"),
    );
    if (blob) {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: displayName,
        });
        return { success: true, message: COPY.exportShareDone };
      }
    }
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = final.toDataURL("image/png");
  link.click();
  return { success: true, message: COPY.exportDownloadDone };
}
