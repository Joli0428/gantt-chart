"use client";

import { forwardRef } from "react";
import type { Task } from "@/lib/gantt/types";
import { COPY } from "@/lib/gantt/constants";
import { MAX_CHART_DAYS } from "@/lib/gantt/range";
import {
  addDays,
  daysFromToday,
  diffDays,
  dayOfWeekShort,
} from "@/lib/gantt/utils";

interface GanttChartViewProps {
  tasks: Task[];
  rangeStart: string;
  rangeEnd: string;
  windowWidth: number;
}

export const GanttChartView = forwardRef<HTMLDivElement, GanttChartViewProps>(
  function GanttChartView({ tasks, rangeStart, rangeEnd, windowWidth }, ref) {
    const rawDays = diffDays(rangeStart, rangeEnd) + 1;
    if (rawDays < 1) return null;

    const totalDays = Math.min(rawDays, MAX_CHART_DAYS);
    const today = daysFromToday(0);
    const dates: string[] = [];
    for (let i = 0; i < totalDays; i++) {
      dates.push(addDays(rangeStart, i));
    }

    const cellW = Math.max(
      38,
      Math.floor((windowWidth - 110 - 40) / Math.min(totalDays, 14)),
    );
    const totalW = 110 + cellW * totalDays;

    return (
      <div id="gantt-capture" ref={ref} style={{ minWidth: totalW, position: "relative" }}>
        <div className="gantt-header">
          <div className="task-col-header">任務</div>
          <div className="date-cols-header">
            {dates.map((d) => {
              const isToday = d === today;
              const dayNum = new Date(d).getDate();
              return (
                <div
                  key={d}
                  className={`date-col-head ${isToday ? "today-head" : ""}`}
                  style={{ minWidth: cellW, flex: "none", width: cellW }}
                >
                  <span className="day-num">{dayNum}</span>
                  <span className="day-name">{dayOfWeekShort(d)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="gantt-body">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-title">{COPY.ganttEmptyTitle}</p>
              <p className="empty-hint">{COPY.ganttEmptyHint}</p>
            </div>
          ) : (
            tasks.map((task) => {
              const barStart = task.start < rangeStart ? rangeStart : task.start;
              const barEnd = task.end > rangeEnd ? rangeEnd : task.end;
              const showBar =
                task.end >= rangeStart && task.start <= rangeEnd;
              let barEl = null;
              if (showBar) {
                const offsetDays = diffDays(rangeStart, barStart);
                const spanDays = diffDays(barStart, barEnd) + 1;
                const left = offsetDays * cellW;
                const width = spanDays * cellW - 6;
                barEl = (
                  <div
                    className="gantt-bar"
                    style={{
                      left: left + 3,
                      width,
                      background: task.color,
                    }}
                  >
                    {task.name}
                  </div>
                );
              }
              return (
                <div key={task.id} className="gantt-row">
                  <div className="task-name-cell">
                    <div
                      className="task-color-dot"
                      style={{ background: task.color }}
                    />
                    <span className="task-name-text">{task.name}</span>
                  </div>
                  <div
                    className="date-cells-row"
                    style={{ width: cellW * totalDays, position: "relative" }}
                  >
                    {dates.map((d) => {
                      const isToday = d === today;
                      return (
                        <div
                          key={d}
                          className={`date-cell ${isToday ? "today-cell" : ""}`}
                          style={{
                            width: cellW,
                            minWidth: cellW,
                            flex: "none",
                            height: 52,
                          }}
                        >
                        </div>
                      );
                    })}
                    {barEl}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  },
);
