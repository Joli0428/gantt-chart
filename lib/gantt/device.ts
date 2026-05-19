/** 電腦（滑鼠為主）→ 下載圖片；手機／平板 → 優先原生分享 */
export function prefersDownloadExport(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
