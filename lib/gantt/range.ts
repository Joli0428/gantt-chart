import { addDays, diffDays } from "./utils";

/** 甘特圖最多渲染天數，避免超大區間拖垮瀏覽器 */
export const MAX_CHART_DAYS = 120;

export function clampDateRange(
  start: string,
  end: string,
): { start: string; end: string; clamped: boolean } {
  if (!start || !end) {
    return { start, end, clamped: false };
  }

  let s = start;
  let e = end;

  if (s > e) {
    [s, e] = [e, s];
  }

  const totalDays = diffDays(s, e) + 1;
  if (totalDays <= MAX_CHART_DAYS) {
    return { start: s, end: e, clamped: false };
  }

  return {
    start: s,
    end: addDays(s, MAX_CHART_DAYS - 1),
    clamped: true,
  };
}

export function getChartDayCount(start: string, end: string): number {
  if (!start || !end) return 0;
  return Math.max(0, diffDays(start, end) + 1);
}
