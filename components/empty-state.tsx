import { View, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "✨",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const colors = useColors();

  return (
    <View className="flex-1 items-center justify-center p-6 gap-4">
      <Text className="text-5xl">{icon}</Text>
      <Text className="text-2xl font-bold text-center" style={{ color: colors.foreground }}>
        {title}
      </Text>
      {description && (
        <Text className="text-center text-base" style={{ color: colors.muted }}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          className="rounded-lg px-6 py-3 mt-4 active:opacity-70"
          style={{ backgroundColor: colors.primary }}
          onPress={onAction}
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
