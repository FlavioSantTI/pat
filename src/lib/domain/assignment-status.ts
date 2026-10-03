import type { AssignmentStatus } from "@/types";

const TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  scheduled: ["started", "skipped", "cancelled", "rescheduled"],
  started: ["completed", "cancelled"],
  completed: [],
  skipped: [],
  cancelled: [],
  rescheduled: [],
};

export function canTransition(
  from: AssignmentStatus,
  to: AssignmentStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: AssignmentStatus, to: AssignmentStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Transição inválida: ${from} → ${to}`);
  }
}

export const FOCUS_TIMER_PRESETS = [10, 15, 20, 25, 30] as const;
