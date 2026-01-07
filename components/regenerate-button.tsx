import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

interface RegenerateButtonProps {
  prompt: string;
  onRegenerate: (prompt: string) => Promise<void>;
  loading?: boolean;
  variant?: "compact" | "full";
}

export function RegenerateButton({
  prompt,
  onRegenerate,
  loading = false,
  variant = "compact",
}: RegenerateButtonProps) {
  const colors = useColors();

  const handlePress = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await onRegenerate(prompt);
  };

  if (variant === "compact") {
    return (
      <TouchableOpacity
        className="px-3 py-2 rounded-full active:opacity-70"
        style={{ backgroundColor: colors.primary }}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="text-white font-semibold text-sm">🔄 Regenerate</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="py-3 rounded-lg items-center active:opacity-70"
      style={{ backgroundColor: colors.primary }}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View className="flex-row items-center gap-2">
          <Text className="text-white font-semibold">🔄</Text>
          <Text className="text-white font-semibold">Regenerate Image</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
