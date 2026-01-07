import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useFavorites } from "@/lib/favorites-context";
import { useChat } from "@/lib/chat-context";
import { DEV_MODE_PROMPTS, getDevModeCategories } from "@/types/dev-mode";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export default function DevModeScreen() {
  const colors = useColors();
  const { state: favState, updatePreferences } = useFavorites();
  const { sendMessage } = useChat();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = getDevModeCategories();
  const filteredPrompts = selectedCategory
    ? DEV_MODE_PROMPTS.filter((p) => p.category === selectedCategory)
    : DEV_MODE_PROMPTS;

  const handleRunPrompt = async (prompt: string) => {
    try {
      setLoading(true);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await sendMessage(`/generate ${prompt}`);
      Alert.alert("Success", "Prompt sent to generation queue");
    } catch (error) {
      Alert.alert("Error", "Failed to run prompt");
    } finally {
      setLoading(false);
    }
  };

  const toggleDevMode = async () => {
    await updatePreferences({ devMode: !favState.preferences.devMode });
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <ScreenContainer className="flex-1">
      {/* Header */}
      <View className="px-4 py-4 border-b" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              🧪 Dev Mode
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              Testing & Debug Prompts
            </Text>
          </View>
          <TouchableOpacity
            className="px-4 py-2 rounded-full active:opacity-70"
            style={{
              backgroundColor: favState.preferences.devMode ? colors.primary : colors.surface,
            }}
            onPress={toggleDevMode}
          >
            <Text
              className="font-semibold text-sm"
              style={{
                color: favState.preferences.devMode ? "#FFFFFF" : colors.foreground,
              }}
            >
              {favState.preferences.devMode ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <Text className="text-xs" style={{ color: colors.muted }}>
          Run pre-configured prompts for testing and debugging image generation features.
        </Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3"
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          className={`px-4 py-2 rounded-full ${
            selectedCategory === null ? "opacity-100" : "opacity-60"
          }`}
          style={{
            backgroundColor: selectedCategory === null ? colors.primary : colors.surface,
          }}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            className="font-semibold text-sm"
            style={{
              color: selectedCategory === null ? "#FFFFFF" : colors.foreground,
            }}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category ? "opacity-100" : "opacity-60"
            }`}
            style={{
              backgroundColor: selectedCategory === category ? colors.primary : colors.surface,
            }}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              className="font-semibold text-sm"
              style={{
                color: selectedCategory === category ? "#FFFFFF" : colors.foreground,
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Prompts List */}
      <FlatList
        data={filteredPrompts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item: prompt }) => (
          <View
            className="rounded-lg p-4"
            style={{
              backgroundColor: colors.surface,
              borderLeftWidth: 4,
              borderLeftColor: prompt.difficulty === "easy" ? "#22C55E" : 
                              prompt.difficulty === "medium" ? "#F59E0B" : "#EF4444",
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: colors.foreground }}>
                  {prompt.icon} {prompt.name}
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.muted }}>
                  {prompt.description}
                </Text>
              </View>
              <View
                className="px-2 py-1 rounded"
                style={{
                  backgroundColor: prompt.difficulty === "easy" ? "#D1FAE5" :
                                  prompt.difficulty === "medium" ? "#FEF3C7" : "#FEE2E2",
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{
                    color: prompt.difficulty === "easy" ? "#065F46" :
                           prompt.difficulty === "medium" ? "#92400E" : "#7F1D1D",
                  }}
                >
                  {prompt.difficulty}
                </Text>
              </View>
            </View>

            {/* Prompt Preview */}
            <View
              className="rounded p-2 mb-3"
              style={{ backgroundColor: colors.background }}
            >
              <Text className="text-xs" style={{ color: colors.muted }}>
                {prompt.prompt || "(empty prompt)"}
              </Text>
            </View>

            {/* Run Button */}
            <TouchableOpacity
              className="py-2 rounded-lg items-center active:opacity-70"
              style={{ backgroundColor: colors.primary }}
              onPress={() => handleRunPrompt(prompt.prompt)}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-sm">
                ▶️ Run Test
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </ScreenContainer>
  );
}
