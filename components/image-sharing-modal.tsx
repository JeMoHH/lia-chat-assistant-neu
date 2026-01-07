import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { shareImage, shareToSocialMedia, downloadImage } from "@/lib/image-utils";

interface ImageSharingModalProps {
  visible: boolean;
  imageUrl: string;
  prompt: string;
  onClose: () => void;
}

export function ImageSharingModal({ visible, imageUrl, prompt, onClose }: ImageSharingModalProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    try {
      setLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const success = await shareImage(imageUrl, `Check out this AI-generated image: "${prompt}"`);
      if (success) {
        Alert.alert("Success", "Image shared successfully!");
      } else {
        Alert.alert("Info", "Sharing not available on this device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share image");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const fileName = `lia-${prompt.substring(0, 20)}-${Date.now()}.jpg`;
      const uri = await downloadImage(imageUrl, fileName);
      if (uri) {
        Alert.alert("Success", "Image downloaded successfully!");
      } else {
        Alert.alert("Error", "Failed to download image");
      }
    } catch (error) {
      Alert.alert("Error", "Download failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialShare = async (platform: "twitter" | "facebook" | "instagram" | "whatsapp") => {
    try {
      setLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await shareToSocialMedia(imageUrl, platform, `Check out this AI-generated image: "${prompt}"`);
    } catch (error) {
      Alert.alert("Error", `Failed to share to ${platform}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable className="flex-1 bg-black/50" onPress={onClose} />
      <View
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6 gap-4"
        style={{ backgroundColor: colors.background }}
      >
        {/* Header */}
        <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
          Share Image
        </Text>

        {/* Preview */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
            }}
          />
        )}

        {/* Prompt */}
        <Text className="text-sm" style={{ color: colors.muted }}>
          {prompt}
        </Text>

        {/* Action Buttons */}
        <View className="gap-2">
          {/* Download Button */}
          <TouchableOpacity
            className="py-3 rounded-lg items-center active:opacity-70"
            style={{ backgroundColor: colors.surface }}
            onPress={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={{ color: colors.foreground }} className="font-semibold">
                ⬇️ Download
              </Text>
            )}
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            className="py-3 rounded-lg items-center active:opacity-70"
            style={{ backgroundColor: colors.primary }}
            onPress={handleShare}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold">
                📤 Share
              </Text>
            )}
          </TouchableOpacity>

          {/* Social Media Row */}
          <Text className="text-sm font-semibold mt-2" style={{ color: colors.foreground }}>
            Share to Social Media
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: colors.surface }}
              onPress={() => handleSocialShare("twitter")}
              disabled={loading}
            >
              <Text className="text-lg">𝕏</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: colors.surface }}
              onPress={() => handleSocialShare("facebook")}
              disabled={loading}
            >
              <Text className="text-lg">f</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: colors.surface }}
              onPress={() => handleSocialShare("instagram")}
              disabled={loading}
            >
              <Text className="text-lg">📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: colors.surface }}
              onPress={() => handleSocialShare("whatsapp")}
              disabled={loading}
            >
              <Text className="text-lg">💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          className="py-3 rounded-lg items-center active:opacity-70"
          style={{ backgroundColor: colors.border }}
          onPress={onClose}
        >
          <Text style={{ color: colors.foreground }} className="font-semibold">
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
