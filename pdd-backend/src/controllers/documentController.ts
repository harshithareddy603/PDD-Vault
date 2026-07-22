import { Response } from "express";
import { AuthRequest } from "../types";
import * as documentService from "../services/documentService";

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const docs = await documentService.getAll(req.userId!);
    res.json(docs);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { name, category, expiryDate, familyMemberId, priority, source } = req.body;
    const fileUrl = req.file ? `documents/${req.file.filename}` : undefined;
    const doc = await documentService.create(req.userId!, {
      name, category, expiryDate, familyMemberId,
      priority: priority === "true" || priority === true,
      source, fileUrl,
    });
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const doc = await documentService.update(req.userId!, id, req.body);
    res.json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await documentService.remove(req.userId!, id);
    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function bulkDelete(req: AuthRequest, res: Response) {
  try {
    const { ids } = req.body;
    await documentService.bulkDelete(req.userId!, ids);
    res.json({ message: "Bulk deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function getSignedUrl(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const url = await documentService.getSignedUrl(req.userId!, id);
    res.json({ url });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
