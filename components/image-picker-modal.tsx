import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable, Image, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as ImagePickerLib from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (uri: string) => void;
}

export function ImagePickerModal({ visible, onClose, onImageSelected }: ImagePickerModalProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickFromGallery = async () => {
    try {
      setLoading(true);
      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Gallery error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const pickFromCamera = async () => {
    try {
      setLoading(true);
      const result = await ImagePickerLib.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Camera error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedImage) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onImageSelected(selectedImage);
      setSelectedImage(null);
      onClose();
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
          Select Image
        </Text>

        {/* Preview */}
        {selectedImage ? (
          <View className="gap-2">
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 12,
              }}
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center active:opacity-70"
                style={{ backgroundColor: colors.surface }}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={{ color: colors.foreground }} className="font-semibold">
                  Change
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center active:opacity-70"
                style={{ backgroundColor: colors.primary }}
                onPress={handleConfirm}
              >
                <Text className="text-white font-semibold">Use This</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="gap-2">
            <TouchableOpacity
              className="py-4 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: colors.surface }}
              onPress={pickFromGallery}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{ color: colors.foreground }} className="font-semibold">
                  📸 Pick from Gallery
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="py-4 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: colors.surface }}
              onPress={pickFromCamera}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{ color: colors.foreground }} className="font-semibold">
                  📷 Take Photo
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Close Button */}
        <TouchableOpacity
          className="py-3 rounded-lg items-center active:opacity-70"
          style={{ backgroundColor: colors.border }}
          onPress={onClose}
        >
          <Text style={{ color: colors.foreground }} className="font-semibold">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
