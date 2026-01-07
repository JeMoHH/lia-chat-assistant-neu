import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export async function downloadImage(imageUrl: string, fileName: string = "lia-generated-image.jpg"): Promise<string | null> {
  try {
    if (!imageUrl) return null;

    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    // Download the image
    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }
    return null;
  } catch (error) {
    console.error("Download error:", error);
    return null;
  }
}

export async function shareImage(imageUrl: string, title: string = "Check out this AI-generated image!"): Promise<boolean> {
  try {
    if (!imageUrl) return false;

    // For web, use native share if available
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Lia - AI Image Generator",
          text: title,
          url: imageUrl,
        });
        return true;
      }
      return false;
    }

    // For mobile, download and share
    const fileName = `lia-${Date.now()}.jpg`;
    const localUri = await downloadImage(imageUrl, fileName);

    if (localUri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(localUri, {
        mimeType: "image/jpeg",
        dialogTitle: "Share Generated Image",
        UTI: "com.apple.mail-message",
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Share error:", error);
    return false;
  }
}

export async function shareToSocialMedia(
  imageUrl: string,
  platform: "twitter" | "facebook" | "instagram" | "whatsapp",
  caption: string = "Check out this AI-generated image from Lia!"
): Promise<boolean> {
  try {
    const encodedCaption = encodeURIComponent(caption);
    const encodedUrl = encodeURIComponent(imageUrl);

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedCaption}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedCaption}`;
        break;
      case "instagram":
        // Instagram doesn't support direct URL sharing, open app
        if (Platform.OS === "ios") {
          shareUrl = "instagram://app";
        } else {
          shareUrl = "https://www.instagram.com/";
        }
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedCaption}%20${encodedUrl}`;
        break;
    }

    if (Platform.OS === "web") {
      window.open(shareUrl, "_blank");
      return true;
    }

    // For mobile, use Linking
    const { Linking } = require("react-native");
    await Linking.openURL(shareUrl);
    return true;
  } catch (error) {
    console.error("Social media share error:", error);
    return false;
  }
}

export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    if (Platform.OS === "web") {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      return true;
    }

    // Mobile support would require additional libraries
    return false;
  } catch (error) {
    console.error("Clipboard error:", error);
    return false;
  }
}

export function getImageFileName(prompt: string): string {
  const sanitized = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  return `lia-${sanitized}-${Date.now()}.jpg`;
}
