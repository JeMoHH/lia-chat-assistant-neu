import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SharedCode {
  id: string;
  title: string;
  code: string;
  language: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  isPublic: boolean;
  views: number;
  likes: number;
}

const STORAGE_KEY = "lia_shared_codes";

export async function createShareableCode(
  code: string,
  language: string,
  title: string,
  author: string = "Anonymous",
  isPublic: boolean = true,
  expiresIn?: number
): Promise<SharedCode> {
  const id = generateShareId();
  const now = Date.now();

  const sharedCode: SharedCode = {
    id,
    title,
    code,
    language,
    author,
    createdAt: now,
    updatedAt: now,
    expiresAt: expiresIn ? now + expiresIn : undefined,
    isPublic,
    views: 0,
    likes: 0,
  };

  // Save to local storage
  const codes = await getAllSharedCodes();
  codes.push(sharedCode);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes));

  return sharedCode;
}

export async function getSharedCode(id: string): Promise<SharedCode | null> {
  const codes = await getAllSharedCodes();
  const code = codes.find((c) => c.id === id);

  if (code) {
    // Check if expired
    if (code.expiresAt && code.expiresAt < Date.now()) {
      await deleteSharedCode(id);
      return null;
    }

    // Increment views
    code.views++;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  }

  return code || null;
}

export async function getAllSharedCodes(): Promise<SharedCode[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getPublicCodes(): Promise<SharedCode[]> {
  const codes = await getAllSharedCodes();
  return codes.filter((c) => c.isPublic && (!c.expiresAt || c.expiresAt > Date.now()));
}

export async function getCodesByAuthor(author: string): Promise<SharedCode[]> {
  const codes = await getAllSharedCodes();
  return codes.filter((c) => c.author === author && (!c.expiresAt || c.expiresAt > Date.now()));
}

export async function deleteSharedCode(id: string): Promise<void> {
  const codes = await getAllSharedCodes();
  const filtered = codes.filter((c) => c.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function updateSharedCode(id: string, updates: Partial<SharedCode>): Promise<SharedCode | null> {
  const codes = await getAllSharedCodes();
  const index = codes.findIndex((c) => c.id === id);

  if (index === -1) return null;

  codes[index] = {
    ...codes[index],
    ...updates,
    updatedAt: Date.now(),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  return codes[index];
}

export async function likeSharedCode(id: string): Promise<SharedCode | null> {
  const code = await getSharedCode(id);
  if (!code) return null;

  return updateSharedCode(id, { likes: code.likes + 1 });
}

export async function generateShareLink(id: string): Promise<string> {
  // In a real app, this would generate a shareable URL
  // For now, we'll just return a local reference
  return `lia://share/${id}`;
}

export async function importSharedCode(shareLink: string): Promise<SharedCode | null> {
  // Extract ID from share link
  const match = shareLink.match(/lia:\/\/share\/(.+)/);
  if (!match) return null;

  return getSharedCode(match[1]);
}

function generateShareId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function getPopularCodes(limit: number = 10): Promise<SharedCode[]> {
  const codes = await getPublicCodes();
  return codes.sort((a, b) => b.likes + b.views - (a.likes + a.views)).slice(0, limit);
}

export async function searchSharedCodes(query: string): Promise<SharedCode[]> {
  const codes = await getPublicCodes();
  const lowerQuery = query.toLowerCase();

  return codes.filter(
    (c) =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.author.toLowerCase().includes(lowerQuery) ||
      c.code.toLowerCase().includes(lowerQuery)
  );
}

export async function cleanupExpiredCodes(): Promise<number> {
  const codes = await getAllSharedCodes();
  const now = Date.now();
  const filtered = codes.filter((c) => !c.expiresAt || c.expiresAt > now);
  const removed = codes.length - filtered.length;

  if (removed > 0) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  return removed;
}
