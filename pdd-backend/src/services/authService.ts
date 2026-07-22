import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";
import { users } from "../utils/db";
import { v4 as uuidv4 } from "uuid";

export async function signUp(email: string, password: string, name?: string, phone?: string, avatarUrl?: string) {
  const existing = users.find((u) => u.email === email);
  if (existing) throw new Error("Email already in use");
  
  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    id: uuidv4(),
    email,
    passwordHash,
    name: name || null,
    phone: phone || null,
    bloodGroup: null,
    address: null,
    avatarUrl: avatarUrl || null,
    aadhaarVerified: false,
    aadhaarLast4: null,
    createdAt: new Date(),
  };
  users.push(user);
  
  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function signIn(email: string, password: string) {
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("Invalid credentials");
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");
  
  const token = signToken({ userId: user.id, email: user.email });
  return { token, user: { id: user.id, email: user.email, name: user.name } };
}

export async function getMe(userId: string) {
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string; bloodGroup?: string; address?: string }) {
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");
  
  users[idx] = {
    ...users[idx],
    ...data,
  };
  return users[idx];
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");
  
  users[idx].avatarUrl = avatarUrl;
  return users[idx];
}

export async function checkEmail(email: string) {
  const exists = users.some((u) => u.email === email);
  return { exists };
}
