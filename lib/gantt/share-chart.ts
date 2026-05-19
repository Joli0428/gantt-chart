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
    height: captureEl.scrollHeight,
    windowWidth: captureEl.scrollWidth,
    windowHeight: captureEl.scrollHeight,
    onclone: (clonedDoc) => {
      clonedDoc.getElementById("gantt-capture")?.classList.add("export-capture");
    },
  });

  const s = 2;
  const pad = 48 * s;
  const titleFontSize = 28 * s;
  const subFontSize = 12 * s;
  const titleLineGap = 10 * s;
  const titleBlockH = Math.ceil(
    titleFontSize * 1.35 + titleLineGap + subFontSize * 1.35,
  );
  const titleH = titleBlockH + 24 * s;

  const final = document.createElement("canvas");
  final.width = canvas.width + pad * 2;
  final.height = canvas.height + pad * 2 + titleH;
  const ctx = final.getContext("2d");
  if (!ctx) throw new Error("無法建立 canvas context");

  ctx.fillStyle = "#F7F6F3";
  ctx.fillRect(0, 0, final.width, final.height);

  ctx.textBaseline = "top";
  ctx.fillStyle = "#2C2B28";
  ctx.font = `500 ${titleFontSize}px Lora, serif`;
  ctx.fillText(displayName, pad, pad);

  ctx.font = `300 ${subFontSize}px "Noto Sans TC", sans-serif`;
  ctx.fillStyle = "#B5B3AE";
  const today = new Date().toLocaleDateString("zh-TW");
  ctx.fillText(
    `Generated ${today}`,
    pad,
    pad + titleFontSize * 1.35 + titleLineGap,
  );

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
