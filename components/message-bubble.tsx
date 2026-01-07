import { View, Text, ActivityIndicator } from "react-native";
import type { Message } from "@/types/chat";
import { useColors } from "@/hooks/use-colors";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <View
      className={`mb-3 ${isUser ? "items-end" : "items-start"}`}
      style={{ maxWidth: "80%" }}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${isUser ? "self-end" : "self-start"}`}
        style={{
          backgroundColor: isUser ? colors.primary : colors.surface,
        }}
      >
        {message.isTyping ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color={colors.muted} />
            <Text className="text-sm" style={{ color: colors.muted }}>
              Typing...
            </Text>
          </View>
        ) : (
          <Text
            className="text-base leading-relaxed"
            style={{
              color: isUser ? "#FFFFFF" : colors.foreground,
            }}
          >
            {message.content}
          </Text>
        )}
      </View>
      <Text className="text-xs mt-1 px-2" style={{ color: colors.muted }}>
        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </View>
  );
}
