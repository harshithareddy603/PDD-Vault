import { Response } from "express";
import { AuthRequest } from "../types";
import * as familyService from "../services/familyService";

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const members = await familyService.getAll(req.userId!);
    res.json(members);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const { name } = req.body;
    const member = await familyService.create(req.userId!, name);
    res.status(201).json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const member = await familyService.update(req.userId!, id, name);
    res.json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await familyService.remove(req.userId!, id);
    res.json({ message: "Deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
