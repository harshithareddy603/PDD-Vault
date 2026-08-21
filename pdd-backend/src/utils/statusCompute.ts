import { DocStatus } from "../types";

export type MilestoneCategory =
  | "expired"
  | "hour_1"
  | "day_1"
  | "week_1"
  | "week_2"
  | "week_3"
  | "week_4"
  | "safe";

export function computeMilestone(expiryDate?: Date | null): MilestoneCategory {
  if (!expiryDate) return "safe";
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return "expired";
  if (hours < 1 || minutes <= 60) return "hour_1";
  if (days < 1 || hours <= 24) return "day_1";
  if (days <= 7) return "week_1";
  if (days <= 14) return "week_2";
  if (days <= 21) return "week_3";
  if (days <= 30) return "week_4";
  return "safe";
}

export function computeStatus(expiryDate?: Date | null): DocStatus {
  if (!expiryDate) return "safe";

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "soon";
  return "safe";
}

