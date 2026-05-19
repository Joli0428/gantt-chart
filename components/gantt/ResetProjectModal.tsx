"use client";

import { COPY } from "@/lib/gantt/constants";

export type ResetStep = 1 | 2;

interface ResetProjectModalProps {
  step: ResetStep | null;
  onClose: () => void;
  onAdvance: () => void;
  onConfirm: () => void;
}

export function ResetProjectModal({
  step,
  onClose,
  onAdvance,
  onConfirm,
}: ResetProjectModalProps) {
  const open = step !== null;
  if (!open || step === null) return null;

  const isStep1 = step === 1;

  return (
    <div
      className="modal-overlay reset-modal open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-sheet">
        <div className="modal-handle" />
        <h2 className="modal-title reset-modal-title">
          {isStep1 ? COPY.resetStep1Title : COPY.resetStep2Title}
        </h2>
        <p className="reset-modal-body">
          {isStep1 ? COPY.resetStep1Body : COPY.resetStep2Body}
        </p>
        <div className="reset-modal-actions">
          <button type="button" className="btn-reset-safe" onClick={onClose}>
            {isStep1 ? COPY.resetStep1Cancel : COPY.resetStep2Cancel}
          </button>
          {isStep1 ? (
            <button type="button" className="btn-reset-risk" onClick={onAdvance}>
              {COPY.resetStep1Confirm}
            </button>
          ) : (
            <button type="button" className="btn-reset-risk" onClick={onConfirm}>
              {COPY.resetStep2Confirm}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
