"use client";

import { COLORS } from "@/lib/gantt/constants";

interface TaskModalProps {
  open: boolean;
  inputName: string;
  inputStart: string;
  inputEnd: string;
  selectedColor: string;
  onClose: () => void;
  onNameChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onColorSelect: (v: string) => void;
  onConfirm: () => void;
}

export function TaskModal({
  open,
  inputName,
  inputStart,
  inputEnd,
  selectedColor,
  onClose,
  onNameChange,
  onStartChange,
  onEndChange,
  onColorSelect,
  onConfirm,
}: TaskModalProps) {
  return (
    <div
      className={`modal-overlay ${open ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-title">新增任務</div>

        <div className="form-group">
          <label className="form-label" htmlFor="inputName">
            任務名稱 Task Name
          </label>
          <input
            id="inputName"
            type="text"
            className="form-input"
            placeholder="例：設計稿完成"
            maxLength={20}
            value={inputName}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        <div className="date-row">
          <div className="form-group">
            <label className="form-label" htmlFor="inputStart">
              開始日期 Start
            </label>
            <input
              id="inputStart"
              type="date"
              className="form-input"
              value={inputStart}
              onChange={(e) => onStartChange(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="inputEnd">
              結束日期 End
            </label>
            <input
              id="inputEnd"
              type="date"
              className="form-input"
              value={inputEnd}
              onChange={(e) => onEndChange(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">顏色 Color</label>
          <div className="color-picker-row">
            {COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`color-chip ${c.val === selectedColor ? "selected" : ""}`}
                style={{ background: c.val }}
                onClick={() => onColorSelect(c.val)}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        <button type="button" className="btn-confirm" onClick={onConfirm}>
          確認新增 Confirm
        </button>
      </div>
    </div>
  );
}
