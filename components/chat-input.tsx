import { useState, useCallback } from "react";
import { View, TextInput, TouchableOpacity, Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const colors = useColors();
  const [message, setMessage] = useState("");

  const handleSend = useCallback(async () => {
    if (message.trim() && !disabled) {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const text = message;
      setMessage("");
      await onSend(text);
    }
  }, [message, disabled, onSend]);

  return (
    <View
      className="px-4 py-3 border-t"
      style={{
        backgroundColor: colors.background,
        borderTopColor: colors.border,
      }}
    >
      <View className="flex-row items-end gap-2">
        <View className="flex-1">
          <TextInput
            className="rounded-full px-4 py-3 text-base"
            style={{
              backgroundColor: colors.surface,
              color: colors.foreground,
              maxHeight: 120,
            }}
            placeholder="Message Lia..."
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!disabled}
          />
        </View>
        <TouchableOpacity
          className="rounded-full w-12 h-12 items-center justify-center active:opacity-80"
          style={{
            backgroundColor: message.trim() && !disabled ? colors.primary : colors.muted,
            transform: [{ scale: 1 }],
          }}
          onPress={() => handleSend()}
          disabled={!message.trim() || disabled}
          activeOpacity={0.8}
        >
          <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
