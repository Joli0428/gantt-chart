"use client";

import { useEffect, useRef } from "react";
import { COPY } from "@/lib/gantt/constants";
import type { Task } from "@/lib/gantt/types";
import { diffDays, formatDate } from "@/lib/gantt/utils";
import { DeleteIcon, EditIcon } from "./icons";

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
  const dragMoved = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef(tasks);
  const onReorderRef = useRef(onReorder);
  const onShowToastRef = useRef(onShowToast);
  const startDragRef = useRef<
    (card: HTMLDivElement, clientY: number, showHint: boolean) => void
  >(() => {});

  tasksRef.current = tasks;
  onReorderRef.current = onReorder;
  onShowToastRef.current = onShowToast;

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

  const updateDropIndex = (clientY: number) => {
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
  };

  const removeGhost = () => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  };

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      dragMoved.current = true;
      const touch = e.touches[0];
      const ghost = ghostRef.current;
      if (!ghost) return;
      ghost.style.top = `${touch.clientY - ghost.offsetHeight / 2}px`;
      updateDropIndex(touch.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      dragMoved.current = true;
      const ghost = ghostRef.current;
      if (!ghost) return;
      ghost.style.top = `${e.clientY - ghost.offsetHeight / 2}px`;
      updateDropIndex(e.clientY);
    };

    const finishDrag = () => {
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
        dragMoved.current &&
        over !== null &&
        src !== null &&
        over !== src &&
        over !== src + 1
      ) {
        onReorderRef.current(src, over);
      }

      isDragging.current = false;
      dragMoved.current = false;
      dragSrcIndex.current = null;
      dragOverIndex.current = null;
    };

    function onTouchEnd() {
      finishDrag();
    }

    function onMouseUp() {
      finishDrag();
    }

    const attachDragListeners = () => {
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    const startDrag = (
      card: HTMLDivElement,
      clientY: number,
      showHint: boolean,
    ) => {
      if (isDragging.current) return;

      isDragging.current = true;
      dragMoved.current = false;
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
      if (showHint) onShowToastRef.current("拖曳以重新排序");

      updateDropIndex(clientY);
      attachDragListeners();
    };

    startDragRef.current = startDrag;

    return () => {
      cancelLongPress();
      removeGhost();
      finishDrag();
    };
  }, []);

  const onHandleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    card: HTMLDivElement,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    startDragRef.current(card, e.clientY, false);
  };

  const onHandleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    card: HTMLDivElement,
  ) => {
    e.stopPropagation();
    const touch = e.touches[0];

    longPressTimer.current = setTimeout(() => {
      startDragRef.current(card, touch.clientY, true);
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
              <div className="task-card" data-index={i} data-id={t.id}>
                <div
                  className="drag-handle"
                  title="拖曳排序"
                  onMouseDown={(e) =>
                    onHandleMouseDown(e, e.currentTarget.closest(".task-card")!)
                  }
                  onTouchStart={(e) =>
                    onHandleTouchStart(e, e.currentTarget.closest(".task-card")!)
                  }
                >
                  <span />
                  <span />
                  <span />
                </div>
                <div className="task-card-color" style={{ background: t.color }} />
                <div className="task-card-info">
                  <div className="task-card-name">{t.name}</div>
                  <div className="task-card-dates">
                    {formatDate(t.start)} → {formatDate(t.end)} · {diffDays(t.start, t.end) + 1} 天
                  </div>
                </div>
                <div className="task-card-actions">
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => onEdit(t)}
                    title="編輯"
                    aria-label={`編輯任務：${t.name}`}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => onDelete(t.id)}
                    title="刪除"
                    aria-label={`刪除任務：${t.name}`}
                  >
                    <DeleteIcon />
                  </button>
                </div>
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
