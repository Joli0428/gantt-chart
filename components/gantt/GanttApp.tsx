"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  APP_NAME,
  COLORS,
  COPY,
  createInitialProjectState,
  getDefaultTaskDates,
} from "@/lib/gantt/constants";
import { ResetProjectModal, type ResetStep } from "./ResetProjectModal";
import { shareChart } from "@/lib/gantt/share-chart";
import type { Task } from "@/lib/gantt/types";
import { Header } from "./Header";
import { ProjectBar } from "./ProjectBar";
import { GanttChartView } from "./GanttChartView";
import { TaskListSection } from "./TaskListSection";
import { TaskModal } from "./TaskModal";
import { PlusIcon } from "./icons";

function useToast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2200);
  }, []);

  return { message, visible, showToast };
}

export default function GanttApp() {
  const initial = createInitialProjectState();
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [projectName, setProjectName] = useState(initial.projectName);
  const [rangeStart, setRangeStart] = useState(initial.rangeStart);
  const [rangeEnd, setRangeEnd] = useState(initial.rangeEnd);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].val);
  const [nextId, setNextId] = useState(initial.nextId);
  const [resetStep, setResetStep] = useState<ResetStep | null>(null);
  const [sharing, setSharing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(375);
  const [inputName, setInputName] = useState("");
  const [inputStart, setInputStart] = useState("");
  const [inputEnd, setInputEnd] = useState("");
  const captureRef = useRef<HTMLDivElement>(null);
  const { message: toastMsg, visible: toastVisible, showToast } = useToast();

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const openModal = () => {
    const dates = getDefaultTaskDates();
    setEditingTaskId(null);
    setInputName("");
    setInputStart(dates.start);
    setInputEnd(dates.end);
    setSelectedColor(COLORS[0].val);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setInputName(task.name);
    setInputStart(task.start);
    setInputEnd(task.end);
    setSelectedColor(task.color);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTaskId(null);
  };

  const saveTask = () => {
    const name = inputName.trim();
    if (!name) {
      showToast("請輸入任務名稱");
      return;
    }
    if (!inputStart || !inputEnd) {
      showToast("請選擇日期");
      return;
    }
    if (inputStart > inputEnd) {
      showToast("開始日期不能晚於結束日期");
      return;
    }

    if (inputStart < rangeStart) setRangeStart(inputStart);
    if (inputEnd > rangeEnd) setRangeEnd(inputEnd);

    if (editingTaskId !== null) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTaskId
            ? {
                ...t,
                name,
                start: inputStart,
                end: inputEnd,
                color: selectedColor,
              }
            : t,
        ),
      );
      closeModal();
      showToast(COPY.taskUpdated);
      return;
    }

    const newId = nextId;
    setNextId((id) => id + 1);
    setTasks((prev) => [
      ...prev,
      {
        id: newId,
        name,
        start: inputStart,
        end: inputEnd,
        color: selectedColor,
      },
    ]);

    setSelectedColor(COLORS[tasks.length % COLORS.length].val);
    closeModal();
    showToast(COPY.taskAdded);
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const reorderTasks = (fromIndex: number, toIndex: number) => {
    setTasks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex;
      next.splice(insertAt, 0, moved);
      return next;
    });
  };

  const applyInitialState = () => {
    const fresh = createInitialProjectState();
    setTasks(fresh.tasks);
    setProjectName(fresh.projectName);
    setRangeStart(fresh.rangeStart);
    setRangeEnd(fresh.rangeEnd);
    setNextId(fresh.nextId);
    setSelectedColor(fresh.selectedColor);
    setModalOpen(false);
    setEditingTaskId(null);
    setResetStep(null);
  };

  const handleResetConfirm = () => {
    applyInitialState();
    showToast(COPY.resetSuccess);
  };

  const handleShare = async () => {
    if (!captureRef.current) return;
    setSharing(true);
    try {
      const result = await shareChart(
        captureRef.current,
        projectName || APP_NAME,
      );
      showToast(result.message);
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") {
        showToast("發生錯誤，請再試");
        console.error(e);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="gantt-app">
      <Header onShare={handleShare} sharing={sharing} />
      <ProjectBar
        projectName={projectName}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onProjectNameChange={setProjectName}
        onRangeStartChange={setRangeStart}
        onRangeEndChange={setRangeEnd}
        onRequestReset={() => setResetStep(1)}
      />
      <div className="gantt-section">
        <div className="gantt-scroll-outer">
          <GanttChartView
            ref={captureRef}
            tasks={tasks}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            windowWidth={windowWidth}
          />
        </div>
      </div>
      <div className="add-task-section">
        <button type="button" className="btn-add-task" onClick={openModal}>
          <PlusIcon />
          {tasks.length === 0 ? COPY.addTaskFirst : COPY.addTaskMore}
        </button>
      </div>
      <TaskListSection
        tasks={tasks}
        onDelete={deleteTask}
        onEdit={openEditModal}
        onReorder={reorderTasks}
        onShowToast={showToast}
      />
      <div className="bottom-pad" />
      <TaskModal
        open={modalOpen}
        mode={editingTaskId !== null ? "edit" : "add"}
        inputName={inputName}
        inputStart={inputStart}
        inputEnd={inputEnd}
        selectedColor={selectedColor}
        onClose={closeModal}
        onNameChange={setInputName}
        onStartChange={setInputStart}
        onEndChange={setInputEnd}
        onColorSelect={setSelectedColor}
        onConfirm={saveTask}
      />
      <ResetProjectModal
        step={resetStep}
        onClose={() => setResetStep(null)}
        onAdvance={() => setResetStep(2)}
        onConfirm={handleResetConfirm}
      />
      <div className={`toast ${toastVisible ? "show" : ""}`}>{toastMsg}</div>
    </div>
  );
}
