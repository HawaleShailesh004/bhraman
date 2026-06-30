import type { Difficulty } from "@prisma/client";

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function difficultyLabel(difficulty: Difficulty) {
  const labels: Record<Difficulty, string> = {
    EASY: "Easy",
    MODERATE: "Moderate",
    CHALLENGING: "Challenging",
    EXTREME: "Extreme",
  };
  return labels[difficulty];
}

export function difficultyLevel(difficulty: Difficulty): 1 | 2 | 3 {
  if (difficulty === "EASY") return 1;
  if (difficulty === "MODERATE") return 2;
  return 3;
}

export function formatDuration(hours: number) {
  if (hours >= 24) {
    return `${Math.round(hours)} hrs`;
  }
  if (Number.isInteger(hours)) {
    return `${hours} hrs`;
  }
  return `${hours} hrs`;
}
