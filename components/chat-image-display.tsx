import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";

export interface ChatImage {
  id: string;
  uri: string;
  title?: string;
  description?: string;
  timestamp: number;
  sender: "user" | "assistant";
}

interface ChatImageDisplayProps {
  image: ChatImage;
  onPress?: () => void;
  onAddToGallery?: (image: ChatImage) => void;
}

export function ChatImageDisplay({ image, onPress, onAddToGallery }: ChatImageDisplayProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="gap-2 mb-2">
      <TouchableOpacity
        className="rounded-lg overflow-hidden"
        style={{ backgroundColor: colors.surface }}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {loading && (
          <View className="w-full h-48 items-center justify-center" style={{ backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!loading && !error && (
          <Image
            source={{ uri: image.uri }}
            style={{ width: "100%", height: 200 }}
            onError={() => setError(true)}
          />
        )}

        {error && (
          <View className="w-full h-48 items-center justify-center" style={{ backgroundColor: colors.surface }}>
            <Text style={{ color: colors.error }} className="text-sm">
              Failed to load image
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {image.title && (
        <Text style={{ color: colors.foreground }} className="text-sm font-semibold px-2">
          {image.title}
        </Text>
      )}

      {image.description && (
        <Text style={{ color: colors.muted }} className="text-xs px-2">
          {image.description}
        </Text>
      )}

      <TouchableOpacity
        className="px-3 py-2 rounded-lg active:opacity-70"
        style={{ backgroundColor: colors.primary }}
        onPress={() => onAddToGallery?.(image)}
      >
        <Text className="text-white text-xs font-semibold text-center">
          💾 Add to Gallery
        </Text>
      </TouchableOpacity>
    </View>
  );
}
