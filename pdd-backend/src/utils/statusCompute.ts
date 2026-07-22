import { DocStatus } from "../types";

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
