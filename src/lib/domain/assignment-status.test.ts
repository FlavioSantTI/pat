import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  FOCUS_TIMER_PRESETS,
} from "./assignment-status";
import { assessmentSchema, weeklyReviewSchema } from "../validations/schemas";

describe("Domain: Assignment Status Machine", () => {
  it("allows transition from scheduled to started", () => {
    expect(canTransition("scheduled", "started")).toBe(true);
  });

  it("allows transition from scheduled to skipped or cancelled", () => {
    expect(canTransition("scheduled", "skipped")).toBe(true);
    expect(canTransition("scheduled", "cancelled")).toBe(true);
  });

  it("allows transition from started to completed", () => {
    expect(canTransition("started", "completed")).toBe(true);
  });

  it("does not allow invalid transitions (e.g. completed to started)", () => {
    expect(canTransition("completed", "started")).toBe(false);
    expect(() => assertTransition("completed", "started")).toThrow();
  });

  it("focus timer presets contain 10, 15, 20, 25, 30", () => {
    expect(FOCUS_TIMER_PRESETS).toEqual([10, 15, 20, 25, 30]);
  });
});

describe("Domain: D/P/A Assessment & Weekly Review Schemas", () => {
  it("validates D/P/A between 0 and 5", () => {
    const valid = assessmentSchema.safeParse({
      domain_score: 4,
      pleasure_score: 3,
      anxiety_score: 2,
      notes: "Boa realização",
      gain: "Iniciei sem hesitar",
    });
    expect(valid.success).toBe(true);

    const invalid = assessmentSchema.safeParse({
      domain_score: 6,
      pleasure_score: -1,
      anxiety_score: 0,
    });
    expect(invalid.success).toBe(false);
  });

  it("validates weekly review 4 core questions", () => {
    const valid = weeklyReviewSchema.safeParse({
      smallest_gain: "Menor ganho da semana",
      flexible_situation: "Situação flexível",
      increased_domain_or_pleasure: "O que aumentou domínio",
      high_anxiety_analysis: "Análise da ansiedade alta",
    });
    expect(valid.success).toBe(true);
  });
});
