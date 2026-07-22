import { Response } from "express";
import { AuthRequest } from "../types";
import * as authService from "../services/authService";
import { getPublicUrl } from "../utils/storage";

export async function signUp(req: AuthRequest, res: Response) {
  try {
    const { email, password, name, phone } = req.body;
    let avatarUrl: string | undefined;
    if (req.file) avatarUrl = getPublicUrl(`avatars/${req.file.filename}`);
    const result = await authService.signUp(email, password, name, phone, avatarUrl);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function signIn(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await authService.signIn(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function signOut(_req: AuthRequest, res: Response) {
  res.json({ message: "Signed out successfully" });
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.userId!);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { name, phone, bloodGroup, address } = req.body;
    const user = await authService.updateProfile(req.userId!, { name, phone, bloodGroup, address });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateAvatar(req: AuthRequest, res: Response) {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const avatarUrl = getPublicUrl(`avatars/${req.file.filename}`);
    const user = await authService.updateAvatar(req.userId!, avatarUrl);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function checkEmail(req: AuthRequest, res: Response) {
  try {
    const { email } = req.query as { email: string };
    const result = await authService.checkEmail(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function resetPassword(_req: AuthRequest, res: Response) {
  res.json({ message: "If that email exists, a reset link has been sent." });
}
