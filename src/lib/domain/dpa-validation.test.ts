import { describe, it, expect } from "vitest";

// D/P/A and Weekly Review Domain Rules & Validation Tests

export function validateDpaScores(domain: number, pleasure: number, anxiety: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validateScore = (val: number, name: string) => {
    if (!Number.isInteger(val)) {
      errors.push(`${name} deve ser um número inteiro.`);
    } else if (val < 0 || val > 5) {
      errors.push(`${name} deve estar na escala de 0 a 5.`);
    }
  };

  validateScore(domain, "Domínio (D)");
  validateScore(pleasure, "Prazer (P)");
  validateScore(anxiety, "Ansiedade (A)");

  return { valid: errors.length === 0, errors };
}

export function validateSmallGain(description: string): { valid: boolean; error?: string } {
  const trimmed = description.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "O pequeno ganho deve ter pelo menos 2 caracteres." };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: "O pequeno ganho não pode exceder 500 caracteres." };
  }
  return { valid: true };
}

export function validateWeeklyReview(review: {
  smallestGain: string;
  flexibleSituation: string;
  increasedDomainOrPleasure: string;
  highAnxietyAnalysis: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!review.smallestGain?.trim()) errors.push("Menor ganho é obrigatório.");
  if (!review.flexibleSituation?.trim()) errors.push("Situação de flexibilidade é obrigatória.");
  if (!review.increasedDomainOrPleasure?.trim()) errors.push("Fator de aumento de domínio ou prazer é obrigatório.");
  if (!review.highAnxietyAnalysis?.trim()) errors.push("Ponto de análise funcional na sessão é obrigatório.");
  return { valid: errors.length === 0, errors };
}

describe("D/P/A Validation Suite", () => {
  it("aceita scores válidos de 0 a 5", () => {
    const res = validateDpaScores(0, 3, 5);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it("rejeita valores menores que 0", () => {
    const res = validateDpaScores(-1, 3, 2);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain("Domínio (D) deve estar na escala de 0 a 5");
  });

  it("rejeita valores maiores que 5", () => {
    const res = validateDpaScores(4, 6, 2);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain("Prazer (P) deve estar na escala de 0 a 5");
  });

  it("rejeita valores decimais não inteiros", () => {
    const res = validateDpaScores(3.5, 2, 1);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain("deve ser um número inteiro");
  });
});

describe("Pequeno Ganho Validation Suite", () => {
  it("aceita descrições claras de pequenos passos", () => {
    const res = validateSmallGain("Consegui regar as plantas mesmo sem vontade");
    expect(res.valid).toBe(true);
  });

  it("rejeita descrições vazias ou com menos de 2 caracteres", () => {
    const res = validateSmallGain(" ");
    expect(res.valid).toBe(false);
    expect(res.error).toBeDefined();
  });
});

describe("Revisão Semanal Validation Suite", () => {
  it("valida preenchimento completo das 4 perguntas funcionais", () => {
    const res = validateWeeklyReview({
      smallestGain: "Liguei para minha mãe",
      flexibleSituation: "Fiquei calmo quando o ônibus atrasou",
      increasedDomainOrPleasure: "Comer no jardim ao ar livre",
      highAnxietyAnalysis: "Dificuldade de falar na reunião de trabalho",
    });
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it("rejeita se faltar qualquer uma das reflexões funcionais", () => {
    const res = validateWeeklyReview({
      smallestGain: "Fiz caminhada",
      flexibleSituation: "",
      increasedDomainOrPleasure: "Descanso",
      highAnxietyAnalysis: "",
    });
    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(2);
  });
});
