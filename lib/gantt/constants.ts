import type { ColorOption, Task } from "./types";
import { addDays, daysFromToday } from "./utils";

export const APP_NAME = "時光包巾";
export const APP_TAGLINE = "甘特圖製作，時間輕鬆掌握";

/** 介面引導文案（空白狀態、placeholder 等） */
export const COPY = {
  projectLabel: "專案名稱",
  projectPlaceholder: "取個名字吧",
  rangeStartLabel: "開始",
  rangeEndLabel: "結束",
  ganttEmptyTitle: "時程表還是空的",
  ganttEmptyHint: "先取個專案名，再點下方按鈕新增第一個任務",
  taskListTitle: "任務",
  taskListEmptyTitle: "還沒有任務",
  taskListEmptyHint: "新增後會出現在這裡，可拖曳調整順序",
  addTaskFirst: "新增第一個任務",
  addTaskMore: "新增任務",
  resetButton: "重新開始",
  resetStep1Title: "要放棄目前專案嗎？",
  resetStep1Body:
    "專案名稱、日期區間與所有任務都會被清除。若只是改個名字，不必重新開始。",
  resetStep1Cancel: "先不要",
  resetStep1Confirm: "我了解，繼續",
  resetStep2Title: "最後確認一次",
  resetStep2Body: "清除後無法復原。確定要回到空白專案嗎？",
  resetStep2Cancel: "返回",
  resetStep2Confirm: "確定清除",
  resetSuccess: "已重新開始，祝規劃順利 ✓",
} as const;

export const COLORS: ColorOption[] = [
  { id: "m1", val: "#C9A99A", name: "霧玫瑰" },
  { id: "m2", val: "#9DB5A0", name: "鼠尾草" },
  { id: "m3", val: "#8FA8BF", name: "霧藍" },
  { id: "m4", val: "#C8B99A", name: "燕麥杏" },
  { id: "m5", val: "#A99BBF", name: "薰衣草" },
  { id: "m6", val: "#A8A49E", name: "暖石灰" },
];

export function getDefaultRange() {
  return {
    start: daysFromToday(-14),
    end: daysFromToday(21),
  };
}

export function getDefaultTaskDates() {
  const today = daysFromToday(0);
  return {
    start: today,
    end: addDays(today, 6),
  };
}

export function createInitialProjectState() {
  const range = getDefaultRange();
  return {
    tasks: [] as Task[],
    projectName: "",
    rangeStart: range.start,
    rangeEnd: range.end,
    nextId: 1,
    selectedColor: COLORS[0].val,
  };
}
