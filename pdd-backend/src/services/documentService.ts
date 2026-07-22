import { documents } from "../utils/db";
import { computeStatus } from "../utils/statusCompute";
import { deleteFile, generateSignedUrl } from "../utils/storage";
import { v4 as uuidv4 } from "uuid";

export async function getAll(userId: string) {
  return documents
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function create(
  userId: string,
  data: {
    name: string;
    category: string;
    expiryDate?: string;
    familyMemberId?: string;
    priority?: boolean;
    source?: string;
    fileUrl?: string;
  }
) {
  const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
  const status = computeStatus(expiryDate);
  const doc = {
    id: uuidv4(),
    userId,
    name: data.name,
    category: data.category,
    expiryDate,
    familyMemberId: data.familyMemberId || null,
    priority: data.priority ?? false,
    source: data.source || null,
    fileUrl: data.fileUrl || null,
    status,
    uploadDate: new Date(),
    createdAt: new Date(),
  };
  documents.push(doc);
  return doc;
}

export async function update(
  userId: string,
  id: string,
  data: {
    name?: string;
    category?: string;
    expiryDate?: string | null;
    priority?: boolean;
    source?: string;
  }
) {
  const idx = documents.findIndex((d) => d.id === id && d.userId === userId);
  if (idx === -1) throw new Error("Document not found");

  const doc = documents[idx];
  const expiryDate =
    data.expiryDate !== undefined
      ? data.expiryDate
        ? new Date(data.expiryDate)
        : null
      : doc.expiryDate;
  const status = computeStatus(expiryDate);

  const updated = {
    ...doc,
    ...data,
    expiryDate,
    status,
  };
  documents[idx] = updated;
  return updated;
}

export async function remove(userId: string, id: string) {
  const idx = documents.findIndex((d) => d.id === id && d.userId === userId);
  if (idx === -1) throw new Error("Document not found");

  const doc = documents[idx];
  if (doc.fileUrl) deleteFile(doc.fileUrl);

  const deleted = documents.splice(idx, 1)[0];
  return deleted;
}

export async function bulkDelete(userId: string, ids: string[]) {
  const toDelete = documents.filter((d) => ids.includes(d.id) && d.userId === userId);
  
  toDelete.forEach((d) => {
    if (d.fileUrl) deleteFile(d.fileUrl);
    const idx = documents.findIndex((doc) => doc.id === d.id);
    if (idx !== -1) {
      documents.splice(idx, 1);
    }
  });

  return { count: toDelete.length };
}

export async function getSignedUrl(userId: string, id: string) {
  const doc = documents.find((d) => d.id === id && d.userId === userId);
  if (!doc) throw new Error("Document not found");
  if (!doc.fileUrl) throw new Error("No file attached to this document");
  return generateSignedUrl(doc.fileUrl);
}
