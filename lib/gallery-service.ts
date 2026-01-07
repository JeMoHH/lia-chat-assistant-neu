import AsyncStorage from "@react-native-async-storage/async-storage";

export interface GalleryImage {
  id: string;
  uri: string;
  title: string;
  description?: string;
  tags: string[];
  addedAt: number;
  source: "chat" | "upload" | "generated";
  metadata?: Record<string, any>;
}

const STORAGE_KEY = "lia_gallery_images";

export async function addToGallery(
  uri: string,
  title: string,
  source: "chat" | "upload" | "generated" = "chat",
  description?: string,
  tags: string[] = []
): Promise<GalleryImage> {
  const image: GalleryImage = {
    id: generateImageId(),
    uri,
    title,
    description,
    tags,
    addedAt: Date.now(),
    source,
  };

  const images = await getAllGalleryImages();
  images.push(image);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(images));

  return image;
}

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getGalleryImage(id: string): Promise<GalleryImage | null> {
  const images = await getAllGalleryImages();
  return images.find((img) => img.id === id) || null;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const images = await getAllGalleryImages();
  const filtered = images.filter((img) => img.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function updateGalleryImage(id: string, updates: Partial<GalleryImage>): Promise<GalleryImage | null> {
  const images = await getAllGalleryImages();
  const index = images.findIndex((img) => img.id === id);

  if (index === -1) return null;

  images[index] = {
    ...images[index],
    ...updates,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  return images[index];
}

export async function searchGalleryImages(query: string): Promise<GalleryImage[]> {
  const images = await getAllGalleryImages();
  const lowerQuery = query.toLowerCase();

  return images.filter(
    (img) =>
      img.title.toLowerCase().includes(lowerQuery) ||
      img.description?.toLowerCase().includes(lowerQuery) ||
      img.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export async function getImagesBySource(source: "chat" | "upload" | "generated"): Promise<GalleryImage[]> {
  const images = await getAllGalleryImages();
  return images.filter((img) => img.source === source);
}

export async function getImagesByTag(tag: string): Promise<GalleryImage[]> {
  const images = await getAllGalleryImages();
  return images.filter((img) => img.tags.includes(tag));
}

export async function addTagToImage(imageId: string, tag: string): Promise<GalleryImage | null> {
  const image = await getGalleryImage(imageId);
  if (!image) return null;

  if (!image.tags.includes(tag)) {
    image.tags.push(tag);
    return updateGalleryImage(imageId, { tags: image.tags });
  }

  return image;
}

export async function removeTagFromImage(imageId: string, tag: string): Promise<GalleryImage | null> {
  const image = await getGalleryImage(imageId);
  if (!image) return null;

  image.tags = image.tags.filter((t) => t !== tag);
  return updateGalleryImage(imageId, { tags: image.tags });
}

export async function getAllTags(): Promise<string[]> {
  const images = await getAllGalleryImages();
  const tags = new Set<string>();

  images.forEach((img) => {
    img.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
}

export async function getGalleryStats(): Promise<{
  total: number;
  bySource: Record<string, number>;
  oldestImage?: GalleryImage;
  newestImage?: GalleryImage;
}> {
  const images = await getAllGalleryImages();

  const bySource = {
    chat: 0,
    upload: 0,
    generated: 0,
  };

  images.forEach((img) => {
    bySource[img.source]++;
  });

  const sorted = [...images].sort((a, b) => a.addedAt - b.addedAt);

  return {
    total: images.length,
    bySource,
    oldestImage: sorted[0],
    newestImage: sorted[sorted.length - 1],
  };
}

export async function clearGallery(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
