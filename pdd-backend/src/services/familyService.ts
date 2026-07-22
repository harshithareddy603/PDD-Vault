import { familyMembers } from "../utils/db";
import { v4 as uuidv4 } from "uuid";

export async function getAll(userId: string) {
  return familyMembers
    .filter((f) => f.userId === userId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function create(userId: string, name: string) {
  const member = {
    id: uuidv4(),
    userId,
    name,
    createdAt: new Date(),
  };
  familyMembers.push(member);
  return member;
}

export async function update(userId: string, id: string, name: string) {
  const idx = familyMembers.findIndex((f) => f.id === id && f.userId === userId);
  if (idx === -1) throw new Error("Family member not found");
  
  familyMembers[idx].name = name;
  return familyMembers[idx];
}

export async function remove(userId: string, id: string) {
  const idx = familyMembers.findIndex((f) => f.id === id && f.userId === userId);
  if (idx === -1) throw new Error("Family member not found");
  
  const deleted = familyMembers.splice(idx, 1)[0];
  return deleted;
}
