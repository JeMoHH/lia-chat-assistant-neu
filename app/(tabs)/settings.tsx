import { ScrollView, Text, View, TouchableOpacity, Alert, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useChat } from "@/lib/chat-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const { state, dispatch } = useChat();

  const handleClearHistory = () => {
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
        clearHistory();
      }
    } else {
      Alert.alert("Clear Chat History", "Are you sure you want to clear all chat history? This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: clearHistory,
        },
      ]);
    }
  };

  const clearHistory = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    dispatch({ type: "SET_CHATS", payload: [] });
    await AsyncStorage.removeItem("@lia_chats");
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 py-3 border-b" style={{ borderBottomColor: colors.border }}>
        <Text className="text-2xl font-bold mb-1" style={{ color: colors.foreground }}>
          Settings
        </Text>
        <Text className="text-sm" style={{ color: colors.muted }}>
          Manage your preferences
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* App Section */}
        <View className="px-4 py-4">
          <Text className="text-xs font-semibold mb-3 uppercase" style={{ color: colors.muted }}>
            Appearance
          </Text>
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <SettingRow
              icon="🌓"
              title="Theme"
              value={colorScheme === "dark" ? "Dark" : "Light"}
              onPress={() => {}}
              colors={colors}
            />
          </View>
        </View>

        {/* Data Section */}
        <View className="px-4 py-4">
          <Text className="text-xs font-semibold mb-3 uppercase" style={{ color: colors.muted }}>
            Data
          </Text>
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <SettingRow
              icon="💬"
              title="Chat History"
              value={`${state.chats.length} conversations`}
              colors={colors}
            />
            <View className="h-px mx-4" style={{ backgroundColor: colors.border }} />
            <SettingRow
              icon="🗑️"
              title="Clear All History"
              onPress={handleClearHistory}
              colors={colors}
              destructive
            />
          </View>
        </View>

        {/* About Section */}
        <View className="px-4 py-4">
          <Text className="text-xs font-semibold mb-3 uppercase" style={{ color: colors.muted }}>
            About
          </Text>
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.surface }}>
            <SettingRow icon="ℹ️" title="Version" value="1.0.0" colors={colors} />
            <View className="h-px mx-4" style={{ backgroundColor: colors.border }} />
            <SettingRow icon="✨" title="Lia Chat Assistant" value="AI-powered assistant" colors={colors} />
          </View>
        </View>

        {/* Footer */}
        <View className="items-center py-8">
          <Text className="text-sm" style={{ color: colors.muted }}>
            Made with ❤️ by Manus
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SettingRow({
  icon,
  title,
  value,
  onPress,
  colors,
  destructive,
}: {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void;
  colors: any;
  destructive?: boolean;
}) {
  const content = (
    <View className="flex-row items-center justify-between px-4 py-4">
      <View className="flex-row items-center flex-1">
        <Text className="text-2xl mr-3">{icon}</Text>
        <Text
          className="text-base font-medium"
          style={{ color: destructive ? colors.error : colors.foreground }}
        >
          {title}
        </Text>
      </View>
      {value && (
        <Text className="text-sm" style={{ color: colors.muted }}>
          {value}
        </Text>
      )}
      {onPress && <IconSymbol name="chevron.right" size={20} color={colors.muted} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
