export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  phone?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  aadhaarVerified: boolean;
  aadhaarLast4?: string | null;
  createdAt: Date;
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  familyMemberId?: string | null;
  name: string;
  category: string;
  expiryDate?: Date | null;
  uploadDate: Date;
  priority: boolean;
  status: "expired" | "soon" | "safe";
  fileUrl?: string | null;
  source?: string | null;
  createdAt: Date;
}

export const users: User[] = [];
export const familyMembers: FamilyMember[] = [];
export const documents: Document[] = [];
