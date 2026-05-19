"use client";

import { COPY } from "@/lib/gantt/constants";

interface ProjectBarProps {
  projectName: string;
  rangeStart: string;
  rangeEnd: string;
  onProjectNameChange: (value: string) => void;
  onRangeStartChange: (value: string) => void;
  onRangeEndChange: (value: string) => void;
  onRequestReset: () => void;
}

export function ProjectBar({
  projectName,
  rangeStart,
  rangeEnd,
  onProjectNameChange,
  onRangeStartChange,
  onRangeEndChange,
  onRequestReset,
}: ProjectBarProps) {
  return (
    <div className="project-bar-wrap">
      <div className="project-bar">
        <div className="project-name-wrap">
          <div className="project-label">{COPY.projectLabel}</div>
          <input
            className="project-name-input"
            placeholder={COPY.projectPlaceholder}
            maxLength={30}
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
          />
        </div>
        <div className="date-range-wrap">
          <div className="date-field">
            <div className="project-label">{COPY.rangeStartLabel}</div>
            <input
              type="date"
              className="date-input"
              value={rangeStart}
              onChange={(e) => onRangeStartChange(e.target.value)}
            />
          </div>
          <div className="date-sep">—</div>
          <div className="date-field">
            <div className="project-label">{COPY.rangeEndLabel}</div>
            <input
              type="date"
              className="date-input"
              value={rangeEnd}
              onChange={(e) => onRangeEndChange(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="project-bar-footer">
        <button type="button" className="btn-reset-project" onClick={onRequestReset}>
          {COPY.resetButton}
        </button>
      </div>
    </div>
  );
}
