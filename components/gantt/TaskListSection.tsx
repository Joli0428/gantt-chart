"use client";

import { useCallback, useEffect, useRef } from "react";
import { COPY } from "@/lib/gantt/constants";
import type { Task } from "@/lib/gantt/types";
import { diffDays, formatDate } from "@/lib/gantt/utils";
import { DeleteIcon } from "./icons";

interface TaskListSectionProps {
  tasks: Task[];
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onShowToast: (msg: string) => void;
}

export function TaskListSection({
  tasks,
  onDelete,
  onEdit,
  onReorder,
  onShowToast,
}: TaskListSectionProps) {
  const dragSrcIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const clearIndicators = () => {
    listRef.current?.querySelectorAll(".drop-indicator").forEach((d) => {
      d.classList.remove("active");
    });
  };

  const updateDropIndex = useCallback((clientY: number) => {
    const cards = listRef.current?.querySelectorAll(
      ".task-card:not(.dragging)",
    );
    clearIndicators();

    let newDragOver = tasksRef.current.length;
    cards?.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const idx = parseInt((card as HTMLElement).dataset.index || "0", 10);
      if (clientY < midY) {
        newDragOver = Math.min(newDragOver, idx);
      }
    });

    dragOverIndex.current = newDragOver;
    const activeInd = listRef.current?.querySelector(
      `.drop-indicator[data-drop="${newDragOver}"]`,
    );
    activeInd?.classList.add("active");
  }, []);

  const removeGhost = () => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  };

  const finishDrag = useCallback(() => {
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", onTouchEnd);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    removeGhost();

    const draggingCard = listRef.current?.querySelector(".task-card.dragging");
    if (draggingCard) draggingCard.classList.remove("dragging");
    clearIndicators();

    const src = dragSrcIndex.current;
    const over = dragOverIndex.current;

    if (
      isDragging.current &&
      over !== null &&
      src !== null &&
      over !== src &&
      over !== src + 1
    ) {
      onReorder(src, over);
    }

    isDragging.current = false;
    dragSrcIndex.current = null;
    dragOverIndex.current = null;
  }, [onReorder]);

  const startDrag = (
    card: HTMLDivElement,
    clientY: number,
    showHint: boolean,
  ) => {
    isDragging.current = true;
    dragSrcIndex.current = parseInt(card.dataset.index || "0", 10);

    if (navigator.vibrate) navigator.vibrate(40);

    const rect = card.getBoundingClientRect();
    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.style.width = `${rect.width}px`;
    ghost.style.top = `${clientY - rect.height / 2}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.innerHTML = card.innerHTML;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    card.classList.add("dragging");
    if (showHint) onShowToast("拖曳以重新排序");

    updateDropIndex(clientY);
  };

  function onTouchMove(e: TouchEvent) {
    if (!isDragging.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const ghost = ghostRef.current;
    if (!ghost) return;
    ghost.style.top = `${touch.clientY - ghost.offsetHeight / 2}px`;
    updateDropIndex(touch.clientY);
  }

  function onTouchEnd() {
    finishDrag();
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging.current) return;
    e.preventDefault();
    const ghost = ghostRef.current;
    if (!ghost) return;
    ghost.style.top = `${e.clientY - ghost.offsetHeight / 2}px`;
    updateDropIndex(e.clientY);
  }

  function onMouseUp() {
    finishDrag();
  }

  useEffect(() => {
    return () => {
      cancelLongPress();
      removeGhost();
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [finishDrag]);

  const onHandleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    card: HTMLDivElement,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(card, e.clientY, false);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onHandleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    card: HTMLDivElement,
  ) => {
    e.stopPropagation();
    const touch = e.touches[0];

    longPressTimer.current = setTimeout(() => {
      startDrag(card, touch.clientY, true);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
    }, 300);

    const cancel = () => cancelLongPress();
    e.currentTarget.addEventListener("touchend", cancel, { once: true });
    e.currentTarget.addEventListener("touchmove", cancel, { once: true });
  };

  return (
    <div className="task-list-section">
      <div className="task-list-header">
        <div className="section-title">{COPY.taskListTitle}</div>
        {tasks.length > 0 && (
          <span className="task-list-hint">{COPY.taskListEditHint}</span>
        )}
      </div>
      <div ref={listRef} id="taskList">
        {tasks.length === 0 ? (
          <div className="empty-guide">
            <p className="empty-guide-title">{COPY.taskListEmptyTitle}</p>
            <p className="empty-guide-hint">{COPY.taskListEmptyHint}</p>
          </div>
        ) : (
          tasks.map((t, i) => (
            <div key={t.id}>
              <div className="drop-indicator" data-drop={i} />
              <div
                className="task-card"
                data-index={i}
                data-id={t.id}
              >
                <div
                  className="drag-handle"
                  title="拖曳排序"
                  onMouseDown={(e) => onHandleMouseDown(e, e.currentTarget.closest(".task-card")!)}
                  onTouchStart={(e) => onHandleTouchStart(e, e.currentTarget.closest(".task-card")!)}
                >
                  <span />
                  <span />
                  <span />
                </div>
                <div className="task-card-color" style={{ background: t.color }} />
                <button
                  type="button"
                  className="task-card-info"
                  onClick={() => onEdit(t)}
                  aria-label={`編輯任務：${t.name}`}
                >
                  <div className="task-card-name">{t.name}</div>
                  <div className="task-card-dates">
                    {formatDate(t.start)} → {formatDate(t.end)} · {diffDays(t.start, t.end) + 1} 天
                  </div>
                </button>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id);
                  }}
                  title="刪除"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))
        )}
        {tasks.length > 0 && (
          <div className="drop-indicator" data-drop={tasks.length} />
        )}
      </div>
    </div>
  );
}
