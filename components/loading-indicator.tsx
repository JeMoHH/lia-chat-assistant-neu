import { View, ActivityIndicator, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface LoadingIndicatorProps {
  message?: string;
  size?: "small" | "large";
}

export function LoadingIndicator({ message = "Loading...", size = "large" }: LoadingIndicatorProps) {
  const colors = useColors();

  return (
    <View className="flex-1 items-center justify-center gap-4" style={{ backgroundColor: colors.background }}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={{ color: colors.muted }} className="text-sm">
          {message}
        </Text>
      )}
    </View>
  );
}
